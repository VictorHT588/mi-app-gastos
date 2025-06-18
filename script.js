document.addEventListener('DOMContentLoaded', function() {
    const expenseForm = document.getElementById('expenseForm');
    const expensesList = document.getElementById('expensesList');
    const btnViewExpenses = document.getElementById('btnViewExpenses');
    const btnBackToForm = document.getElementById('btnBackToForm');
    const expensesTable = document.getElementById('expensesTable').getElementsByTagName('tbody')[0];
    const summaryContent = document.getElementById('summaryContent');
    
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    
    // Configurar fecha por defecto como hoy
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expenseDate').value = today;
    
    // Manejar envío del formulario
    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const expense = {
            id: Date.now(),
            date: document.getElementById('expenseDate').value,
            amount: parseFloat(document.getElementById('amount').value),
            currency: document.getElementById('currency').value,
            category: document.getElementById('category').value,
            subcategory: document.getElementById('subcategory').value,
            paymentMethod: document.getElementById('paymentMethod').value,
            description: document.getElementById('description').value,
            necessity: document.querySelector('input[name="necessity"]:checked').value,
            receipt: document.getElementById('receipt').files[0] ? 
                     document.getElementById('receipt').files[0].name : null
        };
        
        expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        
        alert('Gasto registrado correctamente!');
        expenseForm.reset();
        document.getElementById('expenseDate').value = today;
    });
    
    // Mostrar lista de gastos
    btnViewExpenses.addEventListener('click', function() {
        expenseForm.classList.add('hidden');
        expensesList.classList.remove('hidden');
        renderExpenses();
        renderSummary();
    });
    
    // Volver al formulario
    btnBackToForm.addEventListener('click', function() {
        expenseForm.classList.remove('hidden');
        expensesList.classList.add('hidden');
    });
    function showLoader() {
    document.body.insertAdjacentHTML('beforeend', `
    <div id="loader" style="
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255,255,255,0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    ">
    <div class="spinner" style="
        width: 50px;
        height: 50px;
        border: 5px solid #f3f3f3;
        border-top: 5px solid ${getComputedStyle(document.documentElement).getPropertyValue('--primary')};
        border-radius: 50%;
        animation: spin 1s linear infinite;
    "></div>
    </div>
`);
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.remove();
}

// Usar en las funciones principales:
document.addEventListener('DOMContentLoaded', function() {
    showLoader();
    setTimeout(hideLoader, 800); // Simula carga
});
    // Renderizar la tabla de gastos
    function renderExpenses() {
        expensesTable.innerHTML = '';
        
        if (expenses.length === 0) {
            const row = expensesTable.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 6;
            cell.textContent = 'No hay gastos registrados aún.';
            cell.style.textAlign = 'center';
            return;
        }
        
        expenses.forEach(expense => {
            const row = expensesTable.insertRow();
            
            const dateCell = row.insertCell(0);
            dateCell.textContent = formatDate(expense.date);
            
            const amountCell = row.insertCell(1);
            amountCell.textContent = `${expense.currency} ${expense.amount.toFixed(2)}`;
            
            const categoryCell = row.insertCell(2);
            categoryCell.textContent = expense.category;
            
            const descCell = row.insertCell(3);
            descCell.textContent = expense.description || '--';
            
            const paymentCell = row.insertCell(4);
            paymentCell.textContent = expense.paymentMethod;
            
            const actionsCell = row.insertCell(5);
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Eliminar';
            deleteBtn.className = 'btn-secondary';
            deleteBtn.style.padding = '5px 10px';
            deleteBtn.style.fontSize = '0.8rem';
            deleteBtn.addEventListener('click', () => deleteExpense(expense.id));
            actionsCell.appendChild(deleteBtn);
        });
    }
    
    // Renderizar resumen
    function renderSummary() {
        if (expenses.length === 0) {
            summaryContent.innerHTML = '<p>No hay datos para mostrar.</p>';
            return;
        }
        
        // Total gastado
        const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        // Gastos por categoría
        const byCategory = {};
        expenses.forEach(expense => {
            if (!byCategory[expense.category]) {
                byCategory[expense.category] = 0;
            }
            byCategory[expense.category] += expense.amount;
        });
        
        // Gastos por método de pago
        const byPayment = {};
        expenses.forEach(expense => {
            if (!byPayment[expense.paymentMethod]) {
                byPayment[expense.paymentMethod] = 0;
            }
            byPayment[expense.paymentMethod] += expense.amount;
        });
        
        // Crear HTML del resumen
        let html = `
            <p><strong>Total gastado:</strong> ${expenses[0].currency} ${total.toFixed(2)}</p>
            
            <h4>Por categoría:</h4>
            <ul>
        `;
        
        for (const category in byCategory) {
            const percentage = (byCategory[category] / total * 100).toFixed(1);
            html += `<li>${category}: ${expenses[0].currency} ${byCategory[category].toFixed(2)} (${percentage}%)</li>`;
        }
        
        html += `
            </ul>
            
            <h4>Por método de pago:</h4>
            <ul>
        `;
        
        for (const method in byPayment) {
            const percentage = (byPayment[method] / total * 100).toFixed(1);
            html += `<li>${method}: ${expenses[0].currency} ${byPayment[method].toFixed(2)} (${percentage}%)</li>`;
        }
        
        html += '</ul>';
        summaryContent.innerHTML = html;
    }
    
    // Eliminar un gasto
    function deleteExpense(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
            expenses = expenses.filter(expense => expense.id !== id);
            localStorage.setItem('expenses', JSON.stringify(expenses));
            renderExpenses();
            renderSummary();
        }
    }
    
    // Formatear fecha para mostrar
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    function exportToCSV() {
    let csv = "Fecha,Monto,Moneda,Categoría,Descripción,Método de Pago\n";
    expenses.forEach(expense => {
    csv += `"${expense.date}",${expense.amount},${expense.currency},"${expense.category}","${expense.description || ''}","${expense.paymentMethod}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mis-gastos.csv';
    a.click();
    }
});