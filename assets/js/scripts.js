let myChart;

/* Button Function */
function calc_convert(){
    findValues();
    renderGrafica();
}

/* First Step  */
async function findValues(){
    const clp_value = document.querySelector("#clp_value");
    const calc_value = document.querySelector("#calc_value");
    let calc_total = 0;
    try{
        const res = await fetch("https://mindicador.cl/api");
        data = await res.json();

        let exchange_unit = document.querySelector("#exchange_unit").value;
        if (exchange_unit === "dolar"){
            calc_total = clp_value.value / data.dolar.valor;
        } else if (exchange_unit === "euro"){
            calc_total = clp_value.value / data.euro.valor;
        } else if (exchange_unit === "uf"){
            calc_total = clp_value.value / data.uf.valor;
        } else{
            calc_total = 0;
        }
        var selectElement = document.querySelector("#exchange_unit");
        var selectedText = selectElement.options[selectElement.selectedIndex].text;
        if (selectedText == "Seleccione moneda"){
            calc_value.innerHTML = "Selecciones una moneda de cambio";
        }
        else{
            calc_value.innerHTML = "Valor en " + selectedText + " " + calc_total.toFixed(2);
        };
    } catch (error){
        document.querySelector("#error").innerHTML = "Lo sentimos. Tenemos un Error"
    }
}

/* Second Step */
async function getAndCreateDataToChart() {
    let exchange_unit = document.querySelector("#exchange_unit").value;
    let api_url = "https://mindicador.cl/api/" + exchange_unit + "/2024";
    
    const res = await fetch(api_url);
    const exchange_rates = await res.json();
    let info = [];
    let ciclo = 0;
    if (exchange_unit == "uf"){
        ciclo = daysDifferForUF();
    }
    for(let i = ciclo; i < ciclo + 10; i++){
        info.unshift(exchange_rates.serie[i]);
    }

    const labels = info.map((cambio) => {
        return cambio.fecha.split("T")[0].split('-').reverse().join('-');
    });
    const data = info.map((cambio) => {
        return cambio.valor;
    });
    const datasets = [
        {
        label: "Cambio",
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 255, 255, 1)",
        data,
        },
    ];
    return { labels, datasets };
}

async function renderGrafica() {
    const data = await getAndCreateDataToChart();

    if (myChart) {
        myChart.destroy();
    }

    const config = {
        type: "line",
        data,
    };

    const ctx = document.getElementById("myChart").getContext("2d");
    ctx.canvas.style.backgroundColor = "white";
    myChart = new Chart(ctx, config);
    const graph_text = document.querySelector("#graph_text");
    var selectElement = document.querySelector("#exchange_unit");
    var selectedText = selectElement.options[selectElement.selectedIndex].text;
    graph_text.innerHTML = "<h3>Valores Historicos " + selectedText + "</h3> ";
};

function daysDifferForUF(){
    const today = new Date();
    const nextMonth = today.getMonth() + 1;
    const year = today.getFullYear();
    const day9NextMonth = new Date(year, nextMonth, 9);
    if (nextMonth > 11) {
        day9NextMonth.setMonth(0); // Enero es el mes 0
        day9NextMonth.setFullYear(year + 1); // Incrementa el año
    }
    const diffInMs = day9NextMonth - today;
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24)) - 1;
    return diffInDays;
};
