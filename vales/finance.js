// Variables globales (asegúrate de que estén definidas o importadas de otro módulo)
let pizzaPrices = {};
let drinkPrices = {};
let deliveryPrices = {};

// Función para formatear moneda
function formatCurrency(value) {
	let numValue = typeof value === "string" ? Number.parseFloat(value.replace(/[^\d.-]/g, "")) : Number.parseFloat(value);
	if (isNaN(numValue)) return "0";
	numValue = Math.round(numValue);
	return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Función para cerrar el modal financiero
function closeFinanceModal() {
	const modal = document.getElementById("financeModal");
	modal.classList.remove('show');
	setTimeout(() => {
		modal.style.display = "none";
	}, 300); // Este tiempo debe coincidir con la duración de la transición en CSS
}

// Función para calcular el total
function calcularTotal() {
	console.log('Calculando total');
	const orders = JSON.parse(localStorage.getItem("orders")) || [];
	let efectivo = 0, nequi = 0, daviplata = 0, qr = 0, tarjeta = 0;
	let efectivoCount = 0, nequiCount = 0, daviplataCount = 0, qrCount = 0, tarjetaCount = 0;
	let propinas = 0;

	orders.forEach((order) => {
		let orderTotal = 0;
		order.items.forEach((item) => {
			let itemTotal = 0;
			const quantity = Math.max(1, Number.parseInt(item.quantity) || 1);
			if (item.type === 'pizza') {
				itemTotal = quantity * (pizzaPrices[item.size] || 0);
			} else if (item.type === 'drink') {
				itemTotal = quantity * (drinkPrices[item.name.split(" - ")[0]] || 0);
			} else if (item.type === 'didi') {
				itemTotal = Number.parseFloat(item.value) || 0;
			}
			orderTotal += itemTotal;
		});

		if (order.customerType === 'llevar') {
			orderTotal += deliveryPrices[order.deliveryType] || 0;
		}

		orderTotal += Number.parseFloat(order.additionalAmount) || 0;
		propinas += Number.parseFloat(order.tip) || 0;

		switch (order.paymentMethod) {
			case "efectivo":
				efectivo += orderTotal;
				efectivoCount++;
				break;
			case "nequi":
				nequi += orderTotal;
				nequiCount++;
				break;
			case "daviplata":
				daviplata += orderTotal;
				daviplataCount++;
				break;
			case "qr":
				qr += orderTotal;
				qrCount++;
				break;
			case "tarjeta":
				tarjeta += orderTotal;
				tarjetaCount++;
				break;
		}
	});

	const bancolombia = daviplata + qr;
	let total = efectivo + bancolombia + nequi + tarjeta;

	// Restar los montos de inicio de caja
	const inicioCajaEfectivo = parseFloat(document.getElementById("InCajaEfectivo").value) || 0;
	const inicioCajaNequi = parseFloat(document.getElementById("InCajaNequi").value) || 0;
	const inicioCajaDaviplata = parseFloat(document.getElementById("InCajaDaviplata").value) || 0;
	const inicioCajaBancolombia = parseFloat(document.getElementById("InCajaBancolombia").value) || 0;

	efectivo -= inicioCajaEfectivo;
	nequi -= inicioCajaNequi;
	daviplata -= inicioCajaDaviplata;
	bancolombia -= inicioCajaBancolombia;

	// Restar las compras
	const compras = document.querySelectorAll('.compraInput');
	let totalCompras = 0;
	compras.forEach(compra => {
		const montoCompra = parseFloat(compra.value) || 0;
		totalCompras += montoCompra;
	});

	total -= totalCompras;

	// Actualizar los totales en el DOM
	document.getElementById("totalEfectivo").textContent = formatCurrency(efectivo);
	document.getElementById("totalNequi").textContent = formatCurrency(nequi);
	document.getElementById("totalDaviplata").textContent = formatCurrency(daviplata);
	document.getElementById("totalQR").textContent = formatCurrency(qr);
	document.getElementById("totalTarjeta").textContent = formatCurrency(tarjeta);
	document.getElementById("totalBancolombia").textContent = formatCurrency(bancolombia);
	document.getElementById("totalGeneral").textContent = formatCurrency(total);

	// Actualizar los totales de Didi
	document.getElementById("didiEfectivo").textContent = efectivoCount.toString();
	document.getElementById("didiNequi").textContent = nequiCount.toString();
	document.getElementById("didiDaviplata").textContent = daviplataCount.toString();
	document.getElementById("didiQR").textContent = qrCount.toString();
	document.getElementById("didiTarjeta").textContent = tarjetaCount.toString();
	document.getElementById("totalDidi").textContent = formatCurrency(total);

	// Mostrar el total ajustado
	const adjustedTotalDiv = document.getElementById("adjustedTotal");
	adjustedTotalDiv.style.display = "block";
	adjustedTotalDiv.innerHTML = `Total Ajustado: $${formatCurrency(total)}`;
}

// Función para agregar un nuevo campo de compra
function agregarCampoCompra() {
	const container = document.getElementById('comprasContainer');
	const nuevoInput = document.createElement('input');
	nuevoInput.type = 'number';
	nuevoInput.className = 'compraInput';
	nuevoInput.placeholder = 'Monto de compra';
	container.appendChild(nuevoInput);
	nuevoInput.focus();
}

// Función principal para mostrar las finanzas
function showFinances() {
	const orders = JSON.parse(localStorage.getItem("orders")) || [];
	let efectivo = 0, nequi = 0, daviplata = 0, qr = 0, tarjeta = 0;
	let efectivoCount = 0, nequiCount = 0, daviplataCount = 0, qrCount = 0, tarjetaCount = 0;
	let propinas = 0;

	orders.forEach((order) => {
		let orderTotal = 0;
		order.items.forEach((item) => {
			let itemTotal = 0;
			const quantity = Math.max(1, Number.parseInt(item.quantity) || 1);
			if (item.type === 'pizza') {
				itemTotal = quantity * (pizzaPrices[item.size] || 0);
			} else if (item.type === 'drink') {
				itemTotal = quantity * (drinkPrices[item.name.split(" - ")[0]] || 0);
			} else if (item.type === 'didi') {
				itemTotal = Number.parseFloat(item.value) || 0;
			}
			orderTotal += itemTotal;
		});

		if (order.customerType === 'llevar') {
			orderTotal += deliveryPrices[order.deliveryType] || 0;
		}

		orderTotal += Number.parseFloat(order.additionalAmount) || 0;
		propinas += Number.parseFloat(order.tip) || 0;

		switch (order.paymentMethod) {
			case "efectivo":
				efectivo += orderTotal;
				efectivoCount++;
				break;
			case "nequi":
				nequi += orderTotal;
				nequiCount++;
				break;
			case "daviplata":
				daviplata += orderTotal;
				daviplataCount++;
				break;
			case "qr":
				qr += orderTotal;
				qrCount++;
				break;
			case "tarjeta":
				tarjeta += orderTotal;
				tarjetaCount++;
				break;
		}
	});

	const bancolombia = daviplata + qr;
	const total = efectivo + bancolombia + nequi + tarjeta;

	const modalHTML = `
        <div id="financeModal" class="modal">
		
		<div class="modal-content">
		<h2>Reporte Financiero y Cierre Caja</h2>
		<section id="finance">
		<div id="reportes">
		<div class="finance-section">
		<h3>Reporte general:</h3>
		<p>Efectivo: <span id="totalEfectivo">$${formatCurrency(efectivo)}</span> (${efectivoCount} órdenes)</p>
		<p>Nequi: <span id="totalNequi">$${formatCurrency(nequi)}</span> (${nequiCount} órdenes)</p>
		<p>Daviplata: <span id="totalDaviplata">$${formatCurrency(daviplata)}</span> (${daviplataCount} órdenes)</p>
		<p>QR: <span id="totalQR">$${formatCurrency(qr)}</span> (${qrCount} órdenes)</p>
		<p>Tarjeta: <span id="totalTarjeta">$${formatCurrency(tarjeta)}</span> (${tarjetaCount} órdenes)</p>
		<p class="total-line">Total Didi: <span id="totalDidi">$${formatCurrency(total)}</span></p>
		<p class="total-line">Bancolombia: <span id="totalBancolombia">$${formatCurrency(bancolombia)}</span></p>
		<p class="total-line">Total General: <span id="totalGeneral">$${formatCurrency(total)}</span></p>
		</div>
		<div class="finance-section">

		<h3>Didi:</h3>
			<p>Efectivo: <span id="didiEfectivo">${efectivoCount}</span></p>
			<p>Nequi: <span id="didiNequi">${nequiCount}</span></p>
			<p>Daviplata: <span id="didiDaviplata">${daviplataCount}</span></p>
			<p>QR: <span id="didiQR">${qrCount}</span></p>
			<p>Tarjeta: <span id="didiTarjeta">${tarjetaCount}</span></p>
			</div>
			</div>
			<div class="cierreCaja">
			
			<h3>Inicio de caja:</h3>
			<div class="finance-section">
			<p>Efectivo: <input type="number" id="InCajaEfectivo" placeholder="Monto base de caja"></p>
			<p>Nequi: <input type="number" id="InCajaNequi" placeholder="Monto base de caja"></p>
			<p>Daviplata: <input type="number" id="InCajaDaviplata" placeholder="Monto base de caja"></p>
			<p>Bancolombia: <input type="number" id="InCajaBancolombia" placeholder="Monto base de caja"></p>
			</div>
			
			<h3>Compras:</h3>
			<div class="finance-section">
			<div id="comprasContainer">
			<input type="number" class="compraInput" placeholder="Monto de compra">
			</div>
			</div>
			
			
			
			</section>
			<div class="finance-actions">
			<button id="calcularTotalBtn" class="accept-button">Calcular Total</button>
			<button id="cerrarModalBtn" class="cancel-button">Cerrar</button>
			</div>
			<div id="adjustedTotal" style="display: none;"></div>
			</div>
			</div>
			`;

	// Remover modal existente si lo hay
	const existingModal = document.getElementById("financeModal");
	if (existingModal) {
		existingModal.remove();
	}

	// Agregar el modal al body
	document.body.insertAdjacentHTML('beforeend', modalHTML);

	// Mostrar el modal
	const modal = document.getElementById("financeModal");
	modal.style.display = "block";
	// Añade esta línea para activar la animación
	setTimeout(() => modal.classList.add('show'), 10);

	// Agregar event listeners después de que el modal esté en el DOM
	document.getElementById('calcularTotalBtn').addEventListener('click', calcularTotal);
	document.getElementById('cerrarModalBtn').addEventListener('click', closeFinanceModal);

	// Configurar el evento para agregar nuevos campos de compra
	document.getElementById('comprasContainer').addEventListener('keyup', function (e) {
		if (e.key === 'Enter' && e.target.classList.contains('compraInput')) {
			agregarCampoCompra();
		}
	});

	// Configurar el evento de cierre al hacer clic fuera del modal
	window.onclick = (event) => {
		if (event.target === modal) {
			closeFinanceModal();
		}
	};
}

// Función para mostrar el reporte financiero
function showFinanceReport() {
	showFinances();
}

// Exportar las funciones que se necesitan usar en otros archivos
export { showFinances, showFinanceReport, formatCurrency };

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function () {
	const financeButton = document.getElementById('financeButton');
	if (financeButton) {
		financeButton.addEventListener('click', showFinanceReport);
	}
});