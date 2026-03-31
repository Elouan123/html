// 1. Initialisation du Graphique
const ctx = document.getElementById('simulatorChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Capital Initial',
                data: [],
                backgroundColor: 'rgba(203, 213, 225, 0.5)',
                fill: true,
                pointRadius: 0
            },
            {
                label: 'Versements',
                data: [],
                backgroundColor: 'rgba(37, 99, 235, 0.5)',
                fill: true,
                pointRadius: 0
            },
            {
                label: 'Intérêts',
                data: [],
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                fill: true,
                pointRadius: 0
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true }
        },
        plugins: {
            tooltip: { mode: 'index', intersect: false }
        }
    }
});

// 2. Gestion du Slider
const range = document.getElementById('years');
const rangeLabel = document.getElementById('yearsValue');
range.addEventListener('input', () => { rangeLabel.textContent = range.value; });

// 3. Calcul et Validation
document.getElementById('simulatorForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const err = document.getElementById('error-message');
    err.style.display = 'none';

    // Data recovery
    const initial = parseFloat(document.getElementById('initialCapital').value) || 0;
    const monthly = parseFloat(document.getElementById('monthlyDeposit').value) || 0;
    const yieldAnn = parseFloat(document.getElementById('annualYield').value) || 0;
    const years = parseInt(range.value);

    // Validation (A.2)
    if (yieldAnn > 40) {
        err.textContent = "Le rendement ne peut pas dépasser 40%.";
        err.style.display = 'block';
        return;
    }

    // Logic de calcul (B.1)
    let labels = [];
    let dataInitial = [];
    let dataVersements = [];
    let dataInterets = [];

    const monthlyRate = (yieldAnn / 100) / 12;
    let currentTotal = initial;
    let totalDeposits = 0;
    const startYear = new Date().getFullYear();

    for (let m = 0; m <= years * 12; m++) {
        if (m > 0) {
            let interest = currentTotal * monthlyRate;
            currentTotal += interest + monthly;
            totalDeposits += monthly;
        }

        // On enregistre les données une fois par an
        if (m % 12 === 0) {
            labels.push(startYear + (m / 12));
            dataInitial.push(initial);
            dataVersements.push(totalDeposits);
            // Intérêts = Total - (Capital de départ + total des versements)
            dataInterets.push(Math.max(0, currentTotal - initial - totalDeposits));
        }
    }

    // Mise à jour de l'affichage (B.2)
    const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
    document.getElementById('resultsSummary').style.display = 'flex';
    document.getElementById('resTotal').textContent = fmt.format(currentTotal);
    document.getElementById('resGains').textContent = fmt.format(currentTotal - initial - totalDeposits);

    // Mise à jour du graphique (C.3)
    myChart.data.labels = labels;
    myChart.data.datasets[0].data = dataInitial;
    myChart.data.datasets[1].data = dataVersements;
    myChart.data.datasets[2].data = dataInterets;
    myChart.update();
});
