//variabili globali che saranno fetchate
var diz_canzoni;
var frequenze_assolute;
var diz_album_parola;
var ranks;

//altre variabili globali
var listaLemmiTesto = [];
var lastLemmaCliccato = "";
var albumAttuale;
var testoInMostra = false;

const albums = [
    "(Il Signor G)", "(I Borghesi)",
    "(Dialogo Tra Un Impegnato E Un Non So)", "(Far Finta Di Essere Sani)",
    "(Anche Per Oggi Non Si Vola)", "(Liberta Obbligatoria)",
    "(Polli D Allevamento)", "(Anni Affollati)",
    "(Io Se Fossi Gaber)", "(E Pensare Che C Era Il Pensiero)",
    "(Un Idiozia Conquistata A Fatica)", "(La Mia Generazione Ha Perso)",
    "(Io Non Mi Sento Italiano)"
];

//Mostra le statistiche del lemma nella sidebar
function showStatisticsOfLemma(lemmaCliccato) {
    if (lastLemmaCliccato != lemmaCliccato) {
        //questioni grafiche
        changeNodeColorByLabel(lemmaCliccato);
        $("span[lemma='" + lemmaCliccato + "']").css("background-color", "#edd839"); //giallo

        if ($("span[lemma='" + lastLemmaCliccato + "']").attr("ranked") > 0) {
            let last_red_darkness = $("span[lemma='" + lastLemmaCliccato + "']").attr("ranked");
            $("span[lemma='" + lastLemmaCliccato + "']").css("background-color", "rgb(255,0,0," + last_red_darkness + ")");
        } else {
            $("span[lemma='" + lastLemmaCliccato + "']").css("background-color", "transparent");
        }

        lastLemmaCliccato = lemmaCliccato;

        //questioni statistiche
        frequenzaLemmaTesto = listaLemmiTesto.filter(i => i === lemmaCliccato).length;
        frequenzaLemmaAlbum = diz_album_parola[albumAttuale][lemmaCliccato] ?? 0;
        frequenzaLemmaAssoluta = frequenze_assolute[lemmaCliccato] ?? 0;

        //calcolo la frequenza relativa del lemma cliccato in ogni album
        let nParoleAlbumAttuale = Object.keys(diz_album_parola[albumAttuale]).length;
        let frequenzeLemmaAlbums = [];
        albums.forEach((album) => {
            let frequency = parseFloat(((diz_album_parola[album][lemmaCliccato] / nParoleAlbumAttuale) * 1000).toFixed(2));
            frequenzeLemmaAlbums.push(isNaN(frequency) ? 0 : frequency);
        });

        //animazione della sidebar che rientra ed esce
        if ($('#sidebar').css('right') == "0px") {
            $('#sidebar').css('right', '-500px');
            setTimeout(actuallyShow, 250);
        } else
            actuallyShow();

        //mostra sidebar
        function actuallyShow() {
          $("#sidebar").animate({ scrollTop: 0 }, 500);
            $("#parolaCliccata").text(lemmaCliccato.toUpperCase());
            $('#sidebar').css('right', '0px');
            $("#statistiche").empty();
            $("#statistiche").append("<b>RANK</b>: <span style='font-size: 30px'>" + ranks[frequenzaLemmaAssoluta] + "</span>/135");
            createBarChart([frequenzaLemmaTesto, frequenzaLemmaAlbum, frequenzaLemmaAssoluta]);
            createLineChart(frequenzeLemmaAlbums);
        }
    }
}

//cambia colore sfondo parola quando passi col mouse sopra il nodo corrispondente
function evidenzia_parola_nodo_hover(lemmaHover) {
    $("span[lemma='" + lemmaHover + "']").css("background-color", "#feffa6"); //giallo vomitino
}

//vedi sopra
function evidenzia_parola_nodo_leave(lemmaHover) {
    if ($("span[lemma='" + lemmaHover + "']").attr("ranked") > 0) {
        let last_red_darkness = $("span[lemma='" + lemmaHover + "']").attr("ranked");
        $("span[lemma='" + lemmaHover + "']").css("background-color", "rgb(255,0,0," + last_red_darkness + ")");
    } else
        $("span[lemma='" + lemmaHover + "']").css("background-color", "transparent");
}

//script per mostrare il testo della canzone
function mostra_testo(json_text) {
    $("#container_testo").empty();
    listaLemmiTesto = [];
    setWordLabelNormal(); //rimuove il grassetto dalle label del grafo (perché è cambiato il testo)

    var keys = Object.keys(json_text);
    var numeroParoleTesto = keys.length;
    var index = 0;

    //funzione che è tipo un for, ma posso aspettare del tempo tra un ciclo e l'altro (per mostrare la composizione del testo)
    function processNextItem() {
        if (index < keys.length) {
            let elem = json_text[keys[index]];
            let token = elem.token;
            let lemma = elem.lemma;
            let pos = elem.pos;
            let finePos = elem.finePos;
            let morph = elem.morph;

            listaLemmiTesto.push(lemma);

            setWordLabelBold(lemma); //setta in bold le label del grafo
            rank_lemma = ranks[frequenze_assolute[lemma]];
            let red_darkness = 0;

            if (token == null)
                $("#container_testo").append("<br>");
            else if (rank_lemma < 50 && rank_lemma > 3) //se la parola va evidenziata in rosso (perché ha un alto rank)
            {
                red_darkness = (0.8 / ((rank_lemma + 7) / 10));
                $("#container_testo").append("<span class='parola tooltip' pos='" + pos + "' lemma='" + lemma + "' style='border-radius: 5px; background-color: rgba(255, 0, 0, " + red_darkness + ")' ranked='" + red_darkness + "'>" + token + "<span class='tooltiptext'><b style='color:red'>" + lemma.toUpperCase() + "<br></b>" + finePos + "<br>" + morph + "</span></span> ");
            } else if ([",", ".", ";", ":", "...", "?", "!"].includes(token)) //se è un segno di punteggiatura
                $("#container_testo").append("<span style='margin-left:-7px'>" + token + "</span> ");
            else
                $("#container_testo").append("<span class='parola tooltip' pos='" + pos + "' lemma='" + lemma + "'>" + token + "<span class='tooltiptext'><b style='color:red'>" + lemma.toUpperCase() + "<br></b>" + finePos + "<br>" + morph + "</span></span> ");

            index++;
            if (index < 225) //dopo 225 parole generate una alla volta, carica tutto il testo direttamente
                setTimeout(processNextItem, 1000 / numeroParoleTesto);
            else
                processNextItem();

        } else //quando tutto il testo è stato caricato
        {
            testoInMostra = true;
            /* Abilita click su parole con una certa pos */
            $(".parola").click(function() {
                posCliccato = this.getAttribute("pos");
                if (["S", "A", "V"].includes(posCliccato)) {
                    lemmaCliccato = this.getAttribute("lemma");
                    showStatisticsOfLemma(lemmaCliccato);
                }

            });
        }
    }

    processNextItem(); //dà inizio al ciclo che genera il testo
}

function chiudiSidebar()
{
        $('#sidebar').css('right', '-500px');
        changeNodeColorByLabel("easter-egg"); //se uno dei nodi era giallo, torna normale

        //la parola cliccata torna al suo colore naturale
        if ($("span[lemma='" + lastLemmaCliccato + "']").attr("ranked") > 0) {
            let last_red_darkness = $("span[lemma='" + lastLemmaCliccato + "']").attr("ranked");
            $("span[lemma='" + lastLemmaCliccato + "']").css("background-color", "rgb(255,0,0," + last_red_darkness + ")");
        } else {
            $("span[lemma='" + lastLemmaCliccato + "']").css("background-color", "transparent");
        }
        lastLemmaCliccato = "";
}

$(document).ready(function() {
    var lista_canzoni;

    const urls = [
      'src/diz_canzoni.json',
      'src/frequenze_assolute.json',
      'src/diz_album_parola.json',
      'src/ranks.json'
    ];

    Promise.all(
      urls.map(url => {
        return fetch(url)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Errore nell'estrazione dei dati da ${url}`);
            }
            return response.json();
          })
          .catch(error => {
            throw new Error(`Errore nell'estrazione dei dati da ${url}: ${error.message}`);
          });
      })
    )
    .then(data => {
      [diz_canzoni, frequenze_assolute, diz_album_parola, ranks] = data;
      lista_canzoni = Object.keys(diz_canzoni);
    })
    .catch(error => {
      console.error('Errore nel recupero dei dati:', error.message);
    });

    /* SEARCH BAR */
    $("#search-input").on("input", function() {
        chiudiSidebar();
        var inputVal = $(this).val().toLowerCase();
        var autocompleteList = $("#autocomplete-list");
        autocompleteList.empty();

        if (inputVal.length > 0) {
            lista_canzoni.forEach(function(canzone) {
                if (canzone.toLowerCase().indexOf(inputVal) !== -1) {
                    autocompleteList.append(`<li class="autocomplete-item">${canzone}</li>`);
                }
            });
        }
    });

    var json_text;
    
    $(document).on("click", ".autocomplete-item", function() {
        var selectedValue = $(this).text();
        [albumAttuale] = selectedValue.match(/\((.*?)\)/);
        $("#search-input").val(selectedValue);
        $("#autocomplete-list").empty();
        json_text = jQuery.parseJSON(diz_canzoni[selectedValue]);
        $("#testoIniziale").css("display", "none");
        $("#graph_container").css("text-align", "left");
        shrinkAndMoveLeft(); //sposto il grafo a sinistra per far spazio al testo
        mostra_testo(json_text);
    });

    //chiudo la barra di ricerca quando clicco da qualche parte
    $(document).on("click", function(event) {
        if (!$(event.target).closest(".search-container").length) {
            $("#autocomplete-list").empty();
        }
    });

    /* BOTTONE CHE CHIUDE LA SIDEBAR */
    $("#chiudiSidebar").on('click', chiudiSidebar);
  });