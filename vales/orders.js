// SECCIÓN 5: FUNCIONES PARA MANEJAR ÓRDENES

// Función para guardar una orden
function saveOrder(order) {
	const orders = JSON.parse(localStorage.getItem("orders")) || []
	orders.push(order)
	localStorage.setItem("orders", JSON.stringify(orders))
	displayOrders()
}

// Función para mostrar las órdenes guardadas
function displayOrders() {
	const orders = JSON.parse(localStorage.getItem("orders")) || []
	orderList.innerHTML = "<h2>Órdenes Guardadas</h2>"
	if (orders.length === 0) {
		orderList.innerHTML += "<p>No hay órdenes guardadas.</p>"
	} else {
		orders.forEach((order, index) => {
			const orderElement = document.createElement("div")
			orderElement.classList.add("order-item", order.paymentMethod)
			if (order.paid) {
				orderElement.classList.add("paid")
			}
			orderElement.innerHTML = `
                    <p><strong>Orden #${order.valeNumber}</strong></p>
                    <p>Cliente: ${order.customerType} ${order.customerNumber}</p>
                    <p>Teléfono: ${order.phone}</p>
                    <p>Dirección: ${order.address}</p>
                    <p>Total: $${formatCurrency(order.total)}</p>
                    <p>Método de Pago: ${order.paymentMethod}</p>
                    ${order.deliveryType ? `<p>Domicilio: ${order.deliveryType}</p>` : ""}
                    <p>Estado: <span class="status-label status-${order.status}">${order.status}</span></p>
                    <h4>Productos:</h4>
                    <ul>
                        ${order.items.map((item) => `<li>${item.quantity}x ${item.item} ${item.flavor || ""} - $${formatCurrency(item.total)}</li>`).join("")}
                    </ul>
                    <div class="status-buttons">
                        <button class="status-button pending" data-index="${index}" data-status="pending">Pendiente</button>
                        <button class="status-button marchando" data-index="${index}" data-status="marchando">Marchando</button>
                        <button class="status-button completado" data-index="${index}" data-status="completado">Completado</button>
                        <button class="paid-button" data-index="${index}">${order.paid ? "Pagado" : "Marcar como Pagado"}</button>
                    </div>
                    <button class="edit-button" data-index="${index}">Editar</button>
                    <button class="delete-button" data-index="${index}">Eliminar Vale</button>
                    <button class="print-button" data-index="${index}">Imprimir</button>
					${!order.tip ? `<button class="add-tip-button" data-id="${order.valeNumber}">Agregar Propina Voluntaria</button>` : ""}
					`
			orderList.appendChild(orderElement)
		})

		addOrderEventListeners()
	}
	updateDailyCounter()
}

// Función para agregar event listeners a las órdenes
function addOrderEventListeners() {
	const deleteButtons = document.querySelectorAll(".delete-button")
	const editButtons = document.querySelectorAll(".edit-button")
	const statusButtons = document.querySelectorAll(".status-button")
	const paidButtons = document.querySelectorAll(".paid-button")
	const printButtons = document.querySelectorAll(".print-button")
	const addTipButtons = document.querySelectorAll(".add-tip-button")

	deleteButtons.forEach((button) => {
		button.addEventListener("click", function () {
			const index = Number.parseInt(this.getAttribute("data-index"))
			deleteOrder(index)
		})
	})

	editButtons.forEach((button) => {
		button.addEventListener("click", function () {
			const index = Number.parseInt(this.getAttribute("data-index"))
			editOrder(index)
		})
	})

	statusButtons.forEach((button) => {
		button.addEventListener("click", function () {
			const index = Number.parseInt(this.getAttribute("data-index"))
			const newStatus = this.getAttribute("data-status")
			changeOrderStatus(index, newStatus)
		})
	})

	paidButtons.forEach((button) => {
		button.addEventListener("click", function () {
			const index = Number.parseInt(this.getAttribute("data-index"))
			togglePaidStatus(index)
		})
	})

	printButtons.forEach((button) => {
		button.addEventListener("click", function () {
			const index = Number.parseInt(this.getAttribute("data-index"))
			printOrder(index)
		})
	})

	addTipButtons.forEach((button) => {
		button.addEventListener("click", function () {
			const orderId = this.getAttribute("data-id")
			addVoluntaryTip(orderId)
		})
	})
}

// Función para eliminar una orden
function deleteOrder(index) {
	const orders = JSON.parse(localStorage.getItem("orders")) || []
	if (index >= 0 && index < orders.length) {
		orders.splice(index, 1)
		localStorage.setItem("orders", JSON.stringify(orders))
		displayOrders()
	}
}

// Función para editar una orden
function editOrder(index) {
	const orders = JSON.parse(localStorage.getItem("orders")) || []
	if (index >= 0 && index < orders.length) {
		const order = orders[index]
		const editForm = document.getElementById("editForm")
		editForm.innerHTML = `
        <label for="editCustomerType">Tipo de Cliente:</label>
        <select id="editCustomerType">
            <option value="mesa" ${order.customerType === "mesa" ? "selected" : ""}>Mesa</option>
            <option value="llevar" ${order.customerType === "llevar" ? "selected" : ""}>Llevar</option>
            <option value="didi" ${order.customerType === "didi" ? "selected" : ""}>Didi</option>
        </select>
        <label for="editCustomerNumber">Número de Cliente/Mesa:</label>
        <input type="text" id="editCustomerNumber" value="${order.customerNumber}">
        <label for="editPhone">Teléfono:</label>
        <input type="tel" id="editPhone" value="${order.phone}">
        <label for="editAddress">Dirección:</label>
        <input type="text" id="editAddress" value="${order.address}">
        <label for="editPaymentMethod">Método de Pago:</label>
        <select id="editPaymentMethod">
            <option value="efectivo" ${order.paymentMethod === "efectivo" ? "selected" : ""}>Efectivo</option>
            <option value="daviplata" ${order.paymentMethod === "daviplata" ? "selected" : ""}>Daviplata</option>
            <option value="nequi" ${order.paymentMethod === "nequi" ? "selected" : ""}>Nequi</option>
            <option value="qr" ${order.paymentMethod === "qr" ? "selected" : ""}>QR</option>
            <option value="tarjeta" ${order.paymentMethod === "tarjeta" ? "selected" : ""}>Tarjeta</option>
        </select>
        <div id="editItems"></div>
        <button type="button" id="addNewItem">Agregar Nuevo Item</button>
        <label for="editTotal">Total:</label>
        <input type="number" id="editTotal" value="${order.total}" readonly>
        <button type="button" id="saveEdit">Guardar Cambios</button>
      `

		const editItems = document.getElementById("editItems")
		function renderEditItems() {
			editItems.innerHTML = ""
			order.items.forEach((item, itemIndex) => {
				const itemDiv = document.createElement("div")
				itemDiv.innerHTML = `
            <h4>Item ${itemIndex + 1}</h4>
            <label for="editQuantity${itemIndex}">Cantidad:</label>
            <input type="number" id="editQuantity${itemIndex}" value="${item.quantity}" min="1">
            <label for="editItem${itemIndex}">Item:</label>
            <input type="text" id="editItem${itemIndex}" value="${item.item}">
            <label for="editSize${itemIndex}">Tamaño:</label>
            <select id="editSize${itemIndex}">
                <option value="personal" ${item.size === "personal" ? "selected" : ""}>Personal</option>
                <option value="mediana" ${item.size === "mediana" ? "selected" : ""}>Mediana</option>
                <option value="familiar" ${item.size === "familiar" ? "selected" : ""}>Familiar</option>
            </select>
            <label for="editFlavor${itemIndex}">Sabor:</label>
            <input type="text" id="editFlavor${itemIndex}" value="${item.flavor || ""}">
            <label for="editItemTotal${itemIndex}">Total del Item:</label>
            <input type="number" id="editItemTotal${itemIndex}" value="${item.total}">
            <button type="button" class="deleteItem" data-index="${itemIndex}">Eliminar Item</button>
          `
				editItems.appendChild(itemDiv)
			})

			// Agregar event listeners para eliminar items
			document.querySelectorAll(".deleteItem").forEach((button) => {
				button.addEventListener("click", function () {
					const itemIndex = Number.parseInt(this.getAttribute("data-index"))
					order.items.splice(itemIndex, 1)
					renderEditItems()
				})
			})
		}

		renderEditItems()

		// Agregar nuevo item
		document.getElementById("addNewItem").addEventListener("click", () => {
			order.items.push({
				quantity: 1,
				item: "Nuevo Item",
				size: "personal",
				flavor: "",
				total: 0,
			})
			renderEditItems()
		})

		const editModal = document.getElementById("editModal")
		editModal.style.display = "block"

		document.getElementById("saveEdit").addEventListener("click", () => {
			order.customerType = document.getElementById("editCustomerType").value
			order.customerNumber = document.getElementById("editCustomerNumber").value
			order.phone = document.getElementById("editPhone").value
			order.address = document.getElementById("editAddress").value
			order.paymentMethod = document.getElementById("editPaymentMethod").value

			order.items = order.items.map((item, itemIndex) => ({
				quantity: Number.parseInt(document.getElementById(`editQuantity${itemIndex}`).value),
				item: document.getElementById(`editItem${itemIndex}`).value,
				size: document.getElementById(`editSize${itemIndex}`).value,
				flavor: document.getElementById(`editFlavor${itemIndex}`).value,
				total: Number.parseFloat(document.getElementById(`editItemTotal${itemIndex}`).value),
			}))

			order.total = order.items.reduce((sum, item) => sum + item.total, 0)

			orders[index] = order
			localStorage.setItem("orders", JSON.stringify(orders))
			displayOrders()
			editModal.style.display = "none"
		})
	}
}

// Función para cambiar el estado de una orden
function changeOrderStatus(index, newStatus) {
	const orders = JSON.parse(localStorage.getItem("orders")) || []
	if (index >= 0 && index < orders.length) {
		orders[index].status = newStatus
		localStorage.setItem("orders", JSON.stringify(orders))
		displayOrders()
	}
}

// Función para cambiar el estado de pago de una orden
function togglePaidStatus(index) {
	const orders = JSON.parse(localStorage.getItem("orders")) || []
	if (index >= 0 && index < orders.length) {
		orders[index].paid = !orders[index].paid
		localStorage.setItem("orders", JSON.stringify(orders))
		displayOrders()
	}
}
/////////////////////////////////////////////////////////////////////////////////77
///////////////////SECCIÓN 6: FUNCIONES PARA COMPLETAR Y PREVISUALIZAR VALES
//////////////////////////////////////////////////////////////////////////////////7
//////////////////////////////////////////////////////////////////////////////////7



// Función para completar un vale

function completeVale() {
	const valeToComplete = completeValeNumber.value.trim()
	if (valeToComplete) {
		const orders = JSON.parse(localStorage.getItem("orders")) || []
		const orderIndex = orders.findIndex(
			(order) =>
				order.valeNumber === valeToComplete ||
				(order.customerType === "didi" && order.customerNumber === valeToComplete),
		)

		if (orderIndex !== -1) {
			orders[orderIndex].status = "completado"
			localStorage.setItem("orders", JSON.stringify(orders))
			displayOrders()
			previewCompletedOrder(orders[orderIndex])
			alert(`Vale #${valeToComplete} marcado como completado.`)
		} else {
			alert(`No se encontró el vale o número de Didi #${valeToComplete}.`)
		}
	}
}

// Función para previsualizar una orden completada
function previewCompletedOrder(order) {
	orderPreview.innerHTML = `
      <h3>Orden Completada</h3>
      <p><strong>Vale #${order.valeNumber}</strong></p>
      <p>Cliente: ${order.customerType} ${order.customerNumber}</p>
      <p>Teléfono: ${order.phone}</p>
      <p>Dirección: ${order.address}</p>
      <p>Total: ${formatCurrency(order.total)}</p>
      <p>Método de Pago: ${order.paymentMethod}</p>
      ${order.deliveryType ? `<p>Domicilio: ${order.deliveryType}</p>` : ""}
      <p>Estado: Completado</p>
      <h4>Productos:</h4>
      <ul>
          ${order.items.map((item) => `<li>${item.quantity}x ${item.item} ${item.flavor || ""} - $${formatCurrency(item.total)}</li>`).join("")}
      </ul>
    `
}
// SECCIÓN 11: FUNCIONES PARA GENERAR Y VER PDF
// Función para imprimir una orden
function printOrder(index) {
	const orders = JSON.parse(localStorage.getItem("orders")) || []
	if (index >= 0 && index < orders.length) {
		const order = orders[index]
		const printWindow = window.open("", "", "height=600,width=800")
		printWindow.document.write(`
        <html>
        <head>
          <title>Factura #${order.valeNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              color: #2c3e50;
              font-size: 24px;
            }
            .header p {
              margin: 5px 0;
              color: #7f8c8d;
            }
            .invoice-details {
              margin: 20px 0;
              padding: 15px;
              border: 1px solid #eee;
              border-radius: 5px;
            }
            .customer-details {
              margin: 20px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #eee;
            }
            th {
              background-color: #f8f9fa;
              font-weight: bold;
            }
            .total {
              text-align: right;
              font-size: 18px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #7f8c8d;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ARTESANALES PIZZA</h1>
            <p>NIT: 900.XXX.XXX-X</p>
            <p>Dirección: Calle Principal #123</p>
            <p>Tel: (313) 341-9645</p>
          </div>
          
          <div class="invoice-details">
            <h2>FACTURA DE VENTA N° ${order.valeNumber}</h2>
            <p>Fecha: ${order.date}</p>
            <p>Hora: ${new Date().toLocaleTimeString()}</p>
          </div>

          <div class="customer-details">
            <p><strong>Cliente:</strong> ${order.customerType} ${order.customerNumber}</p>
            ${order.phone ? `<p><strong>Teléfono:</strong> ${order.phone}</p>` : ""}
            ${order.address ? `<p><strong>Dirección:</strong> ${order.address}</p>` : ""}
            ${order.deliveryType ? `<p><strong>Tipo de entrega:</strong> ${order.deliveryType}</p>` : ""}
          </div>

          <table>
            <thead>
              <tr>
                <th>Cant.</th>
                <th>Descripción</th>
                <th>Precio Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
				.map((item) => {
					const unitPrice = item.total / item.quantity
					return `
                    <tr>
                      <td>${item.quantity}</td>
                      <td>${item.item} ${item.flavor || ""} ${item.size || ""}</td>
                      <td>$${formatCurrency(unitPrice)}</td>
                      <td>$${formatCurrency(item.total)}</td>
                    </tr>
                  `
				})
				.join("")}
            </tbody>
          </table>

          <div class="total">
            ${order.tip ? `<p>Propina Voluntaria: $${formatCurrency(order.tip)}</p>` : ""}
            <p>TOTAL: $${formatCurrency(order.total)}</p>
            <p>Método de pago: ${order.paymentMethod.toUpperCase()}</p>
          </div>

          <div class="footer">
            <p>¡Gracias por su compra!</p>
            <p>Este documento sirve como soporte de pago</p>
          </div>
        </body>
        </html>`)
		printWindow.document.close()
		printWindow.print()
	}
}

//Función para generar PDF
function generatePDF() {
	const { jsPDF } = window.jspdf
	const doc = new jsPDF()
	const orders = JSON.parse(localStorage.getItem("orders")) || []

	let yOffset = 10
	orders.forEach((order, index) => {
		if (index > 0) {
			doc.addPage()
			yOffset = 10
		}

		doc.setFontSize(18)
		doc.text(`Orden #${order.valeNumber}`, 105, yOffset, { align: "center" })
		yOffset += 10

		doc.setFontSize(12)
		doc.text(`Cliente: ${order.customerType} ${order.customerNumber}`, 10, yOffset)
		yOffset += 7
		doc.text(`Teléfono: ${order.phone}`, 10, yOffset)
		yOffset += 7
		doc.text(`Dirección: ${order.address}`, 10, yOffset)
		yOffset += 7
		doc.text(`Método de Pago: ${order.paymentMethod}`, 10, yOffset)
		yOffset += 7
		if (order.deliveryType) {
			doc.text(`Domicilio: ${order.deliveryType}`, 10, yOffset)
			yOffset += 7
		}

		yOffset += 5
		doc.setFontSize(14)
		doc.text("Productos:", 10, yOffset)
		yOffset += 7

		doc.setFontSize(12)
		order.items.forEach((item) => {
			doc.text(`${item.quantity}x ${item.item} ${item.flavor || ""} - $${formatCurrency(item.total)}`, 15, yOffset)
			yOffset += 7
		})

		yOffset += 5
		doc.setFontSize(14)
		doc.text(`Total: $${formatCurrency(order.total)}`, 10, yOffset)

		if (order.tip) {
			yOffset += 7
			doc.text(`Propina Voluntaria: $${formatCurrency(order.tip)}`, 10, yOffset)
		}
	})

	doc.save("ordenes.pdf")
}

// Event listeners
addPizzaButton.addEventListener("click", addPizzaItem)
addDrinkButton.addEventListener("click", addDrinkItem)
addDidiButton.addEventListener("click", addDidiItem)
pdfButton.addEventListener("click", generatePDF)
printOrderButton.addEventListener("click", () => {
	const orderIndex = prompt("Ingrese el número de orden que desea imprimir:")
	if (orderIndex !== null) {
		printOrder(Number.parseInt(orderIndex) - 1)
	}
})
financeButton.addEventListener("click", showFinances)
manageFlavorsButton.addEventListener("click", manageFlavors)
setValeRangeButton.addEventListener("click", setValeRange)
customerTypeSelect.addEventListener("change", updateCustomerNumberPlaceholder)
customerTypeSelect.addEventListener("change", toggleDeliveryInput)
deliveryTypeSelect.addEventListener("change", updateTotal)

document.addEventListener("input", (e) => {
	if (e.target.classList.contains("size") || e.target.classList.contains("quantity")) {
		updateTotal()
	}
})
function addVoluntaryTip(valeNumber) {
	const orders = JSON.parse(localStorage.getItem("orders")) || [];
	const orderIndex = orders.findIndex(order => order.valeNumber === valeNumber);

	if (orderIndex !== -1) {
		const order = orders[orderIndex];
		if (order.customerType === "mesa") {
			const tipAmount = Math.round(order.total * 0.1);
			order.tip = tipAmount;
			order.total += tipAmount;

			// Actualizar el localStorage
			localStorage.setItem("orders", JSON.stringify(orders));

			// Actualizar la vista
			showFinances();
		} else {
			alert("Solo se puede agregar propina voluntaria a órdenes de mesa.");
		}
	}
}
// Exportar las funciones necesarias
export {
	saveOrder,
	displayOrders,
	deleteOrder,
	editOrder,
	changeOrderStatus,
	togglePaidStatus,
	completeVale,
	previewCompletedOrder,
	printOrder,
	generatePDF,
	addVoluntaryTip
};