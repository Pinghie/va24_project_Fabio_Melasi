const data = [
    { album: "Anche Per Oggi Non Si Vola", words: ["uccello", "realtà", "cosa"] },
    { album: "Anni Affollati", words: ["Dio", "uomo", "cosa"] },
    { album: "Dialogo Tra Un Impegnato E Un Non So", words: ["pelo", "cosa", "operaio"]},
    { album: "E Pensare Che C Era Il Pensiero", words: ["mondo", "sinistra", "cosa"] },
    { album: "Far Finta Di Essere Sani", words: ["cosa", "gesto", "libertà"] },
    { album: "I Borghesi", words: ["donna", "amore", "uomo"] },
    { album: "Il Signor G", words: ["città", "uomo", "chitarra"] },
    { album: "Io Non Mi Sento Italiano", words: ["aria", "mondo", "uomo"] },
    { album: "Io Se Fossi Gaber", words: ["donna", "cosa", "uomo"] },
    { album: "La Mia Generazione Ha Perso", words: ["destra", "sinistra", "obeso"] },
    { album: "Libertà Obbligatoria", words: ["libertà", "uomo", "bello"] },
    { album: "Polli D Allevamento", words: ["moda", "uomo", "padre"] },
    { album: "Un Idiozia Conquistata A Fatica", words: ["uomo", "gente","mondo"] }
];

const nodes = [];
const links = [];

// Confini di forza del svg
const svgWidth = 700;
const svgHeight = 500;
const margin = 30; //padding

// forza dei nodi
const forceX = d3.forceX(svgWidth / 2).strength(0.05);
const forceY = d3.forceY(svgHeight / 2).strength(0.05);


data.forEach(d => {
    //CREAZIONE NODI ALBUM
    const albumNode = {
        id: d.album,
        type: "album"
    };
    nodes.push(albumNode);

    //CREAZIONE NODI PAROLA
    d.words.forEach(word => {
        const wordNodeIndex = nodes.findIndex(n => n.id === word);
        if (wordNodeIndex === -1) { //controllo se un nodo con quella parola fosse già inserito
            const wordNode = {
                id: word,
                type: "word"
            };
            nodes.push(wordNode);
        }

        // Creazione link tra album e parola
        links.push({
            source: d.album,
            target: word
        });
    });
});

const width = 800;
const height = 600;

//resa dinamica del grafico
const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id))
    .force("charge", d3.forceManyBody().strength(-200))
    .force("x", forceX)
    .force("y", forceY)
    .force("bounds", boundForce());

const svg = d3.select("svg");

const link = svg.append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line");

const nodeDrag = d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

const node = svg.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", d => d.type === "album" ? 12 : 23)
    .attr("fill", d => d.type === "album" ? "#801919" : "#ed1313")
    .call(nodeDrag)
    .on("click", handleClick)
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

const labelDrag = d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

const label = svg.append("g")
    .attr("class", "labels")
    .selectAll("text")
    .data(nodes)
    .enter().append("text")
    .attr("class", d => d.type === "album" ? "album-label" : "word-label")
    .text(d => d.id)
    .on("click", handleLabelClick)
    .style("text-anchor", "middle")
    .style("fill", "#333")
    .style("font-size", "12px")
    .attr("dy", d => d.type === "album" ? "1.5em" : "0.35em")
    .call(labelDrag)
    .on("mouseover", handleLabelMouseOver)
    .on("mouseleave", handleLabelMouseLeave);

simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    label
        .attr("x", d => d.x)
        .attr("y", d => d.y);
});

const albumLabels = svg.selectAll(".album-label");
albumLabels.style("fill", "black")
    .style("font-weight", "bold");

/////////////FUNZIONI VARIE PER IL FUNZIONAMENTO E L'INTERATTIVITA' DEL GRAFO

//Funzioni per l'effetto drag
function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
}

function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
}

function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
}

function boundForce() {
    function force() {
        for (const node of nodes) {
            node.x = Math.max(margin, Math.min(svgWidth - margin, node.x));
            node.y = Math.max(margin, Math.min(svgHeight - margin, node.y));
        }
    }
    return force;
}

let clickedWordNode = null;

function handleClick(event, d) {
    if (testoInMostra) {
        if (d.type === "word") {
            if (clickedWordNode !== null) {
                d3.select(clickedWordNode)
                    .attr("fill", "#ed1313");
            }
            lemmaCliccato = d.id;
            showStatisticsOfLemma(lemmaCliccato);
        }
    }
}

function handleLabelClick(event, d) {
    if (testoInMostra) {
        if (d.type === "word") {
            const correspondingNode = svg.selectAll("circle")
                .filter(node => node.id === d.id);

            clickedWordNode = correspondingNode.node();

            lemmaCliccato = d.id;
            showStatisticsOfLemma(lemmaCliccato);
        }
    }
}

function handleLabelMouseOver(event, d) {
    if (d.type === "word") {
        const correspondingNode = svg.selectAll("circle")
            .filter(node => node.id === d.id);

        const currentColor = correspondingNode.style("fill");
        if (currentColor != "rgb(237, 216, 57)") {
            correspondingNode.attr("fill", "#bf0f0f");
            evidenzia_parola_nodo_hover(d.id);
        }
    }
}

function handleLabelMouseLeave(event, d) {
    if (d.type === "word") {
        const correspondingNode = svg.selectAll("circle")
            .filter(node => node.id === d.id);

        const currentColor = correspondingNode.style("fill");
        if (currentColor != "rgb(237, 216, 57)") {
            correspondingNode.attr("fill", "#ed1313");
            evidenzia_parola_nodo_leave(d.id);
        }
    }
}

function handleMouseOver(event, d) {
    if (d.type === "album") {

        d3.selectAll(".album-label")
            .filter(label => label.id === d.id)
            .style("display", "block");

        const albumIndex = nodes.findIndex(node => node.id === d.id);

        const connectedWordIDs = links
            .filter(link => link.source.index === albumIndex)
            .map(link => link.target.id);

        svg.selectAll("circle")
            .filter(node => node.type === "word" && connectedWordIDs.includes(node.id))
            .each(function() {
                if (this.getAttribute("fill") !== "#edd839") {
                    d3.select(this).attr("fill", "#ff7b00");
                    }
                }
            )
    } else if (d.type === "word") {
        const correspondingNode = svg.selectAll("circle")
            .filter(node => node.id === d.id);
        const currentColor = correspondingNode.style("fill");
        if (currentColor !== "rgb(237, 216, 57)") {
            correspondingNode.attr("fill", "#bf0f0f");
            evidenzia_parola_nodo_hover(d.id);
        }
    }
}

function handleMouseOut(event, d) {
    if (d.type === "album") {

        d3.selectAll(".album-label")
            .filter(label => label.id === d.id)
            .style("display", "none");

        svg.selectAll("circle")
            .filter(node => node.type === "word")
            .each(function()
            {
                if (this.getAttribute("fill") !== "#edd839") {
                    d3.select(this).attr("fill", "#ed1313");
                }
            })
    } else if (d.type === "word") {
        const correspondingNode = svg.selectAll("circle")
            .filter(node => node.id === d.id);
        const currentColor = correspondingNode.style("fill");
        if (currentColor !== "rgb(237, 216, 57)") {
            correspondingNode.attr("fill", "#ed1313");
            evidenzia_parola_nodo_leave(d.id);
        }
    }
}

function changeNodeColorByLabel(label) {
    // Trova il nodo corrispondente alla label
    const wordNode = svg.selectAll("circle")
        .filter(d => d.id === label && d.type === "word");

    if (!wordNode.empty()) {
        svg.selectAll("circle")
            .filter(d => d.type === "word")
            .attr("fill", "#ed1313");

        wordNode.attr("fill", "#edd839");
    } else {
        svg.selectAll("circle")
            .filter(d => d.type === "word")
            .attr("fill", "#ed1313");
    }
}

//mette in bold le label passate come parametro
function setWordLabelBold(label) {
    const wordNode = svg.selectAll("circle")
        .filter(d => d.id === label && d.type === "word");

    if (!wordNode.empty()) {
        svg.selectAll(".word-label")
            .filter(d => d.id === label)
            .style("font-weight", "bold");
    }
}

function setWordLabelNormal() {
    svg.selectAll(".word-label")
        .style("font-weight", "normal");
}

function shrinkAndMoveLeft() {
    $("svg").css("left", "350px");
}
