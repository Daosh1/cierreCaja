document.addEventListener("DOMContentLoaded", () => {
	// SECCIÓN 1: DECLARACIÓN DE VARIABLES Y SELECCIÓN DE ELEMENTOS DEL DOM
	const orderForm = document.getElementById("orderForm")
	const orderItems = document.getElementById("orderItems")
	const orderList = document.getElementById("orderList")
	const totalAmount = document.getElementById("totalAmount")
	const additionalAmountInput = document.getElementById("additionalAmount")
	const valeNumber = document.getElementById("valeNumber")
	const addPizzaButton = document.getElementById("addPizza")
	const addDrinkButton = document.getElementById("addDrink")
	const addDidiButton = document.getElementById("addDidi")
	const pdfButton = document.getElementById("pdfButton")
	const printOrderButton = document.getElementById("printOrderButton")
	const financeButton = document.getElementById("financeButton")
	const manageFlavorsButton = document.getElementById("manageFlavorsButton")
	const startVale = document.getElementById("startVale")
	const endVale = document.getElementById("endVale")
	const setValeRangeButton = document.getElementById("setValeRange")
	const currentDateElement = document.getElementById("currentDate")
	const customerTypeSelect = document.getElementById("customerType")
	const customerNumberInput = document.getElementById("customerNumber")
	const customerNumberLabel = document.getElementById("customerNumberLabel")
	const deliveryContainer = document.getElementById("deliveryContainer")
	const deliveryTypeSelect = document.getElementById("deliveryType")
	const completeValeNumber = document.getElementById("completeValeNumber")
	const completeValeButton = document.getElementById("completeValeButton")
	const editModal = document.getElementById("editModal")
	const flavorModal = document.getElementById("flavorModal")
	const orderPreview = document.getElementById("orderPreview")


	// SECCIÓN 2: INICIALIZACIÓN DE VARIABLES Y CARGA DE DATOS
	let currentVale = 1
	const pizzaPrices = JSON.parse(localStorage.getItem("pizzaPrices")) || {
		personal: 16000,
		small: 27000,
		medium: 42000,
		large: 55000,
	}
	const drinkPrices = JSON.parse(localStorage.getItem("drinkPrices")) || {
		"limonada natural": 3000,
		"limonada cerezada": 4500,
		"limonada hierbabuena": 3000,
		"jugo de lulo": 4000,
		"batido de frutos rojos": 4000,
		"coca cola 500ml": 6000,
		"coca cola 350ml": 4000,
	}
	let pizzaFlavors = JSON.parse(localStorage.getItem("pizzaFlavors")) || [
		"hawaiana",
		"napolitana",
		"pollo champiñones",
		"mexicana",
		"ranchera",
		"vegetariana",
		"margarita",
		"ciruela tocineta",
		"espanola",
		"frutas tropicales",
		"Pollo miel mostaza",
		"pollo bbq",
		"pollo jamon",
		"jamon champiñon",
		"americana",
		"peperoni",
		"peperoni maiz y jamon",
		"3 quesos",
		"carnes",
		"jamon y queso",
		"caprichosa",
	]

	const deliveryPrices = {
		no: 0,
		cerca: 2000,
		medio: 3000,
		lejos: 5000,
	}

	// Objeto para almacenar ingredientes y sus precios
	const ingredients = JSON.parse(localStorage.getItem("ingredients")) || {}

	// SECCIÓN 3: FUNCIONES AUXILIARES
	// Función para formatear moneda
	function formatCurrency(value) {
		let numValue = typeof value === "string" ? Number.parseFloat(value.replace(/[^\d.-]/g, "")) : Number.parseFloat(value)
		if (isNaN(numValue)) return "0"
		numValue = Math.round(numValue)
		return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
	}

	// Función para actualizar el total
	function updateTotal() {
		let total = 0
		const items = orderItems.querySelectorAll("tr")
		items.forEach((item) => {
			const quantityInput = item.querySelector(".quantity")
			const quantity = quantityInput ? Math.max(1, Number.parseInt(quantityInput.value) || 1) : 1
			let price = 0
			if (item.querySelector(".size")) {
				const size = item.querySelector(".size").value
				price = pizzaPrices[size] || 0
			} else if (item.querySelector(".drink")) {
				const drink = item.querySelector(".drink").value
				price = drinkPrices[drink.split(" - ")[0]] || 0
			} else if (item.querySelector(".didi-value")) {
				price = Number.parseFloat(item.querySelector(".didi-value").value) || 0
			}
			const itemTotal = quantity * price
			if (item.querySelector(".item-total")) {
				item.querySelector(".item-total").textContent = `$${formatCurrency(itemTotal)}`
			}
			total += itemTotal
		})

		if (customerTypeSelect.value === "llevar") {
			const deliveryPrice = deliveryPrices[deliveryTypeSelect.value] || 0
			total += deliveryPrice
		}

		const additionalAmount = Number.parseFloat(additionalAmountInput.value) || 0
		total += additionalAmount

		totalAmount.textContent = formatCurrency(total)
	}

	// SECCIÓN 4: FUNCIONES PARA AGREGAR ITEMS A LA ORDEN
	// Función para agregar pizza a la orden
	function addPizzaItem() {
		const row = document.createElement("tr")
		if (customerTypeSelect.value === "didi") {
			row.innerHTML = `
        <td><input type="number" class="quantity" value="1" min="1"></td>
        <td colspan="2">
            <input type="number" class="didi-number" placeholder="Número Didi">
        </td>
        <td>
            <input type="number" class="didi-value" placeholder="Valor Didi" min="0">
        </td>
        <td><button type="button" class="delete-item">Eliminar</button></td>
      `
		} else {
			row.innerHTML = `
        <td><input type="number" class="quantity" value="1" min="1"></td>
        <td>
            <select class="size">
                ${Object.keys(pizzaPrices)
					.map((size) => `<option value="${size}">${size}</option>`)
					.join("")}
            </select>
        </td>
        <td>
            <select class="flavor">
                ${pizzaFlavors.map((flavor) => `<option value="${flavor}">${flavor}</option>`).join("")}
            </select>
        </td>
        <td class="item-total">$${formatCurrency(pizzaPrices.personal)}</td>
        <td><button type="button" class="delete-item">Eliminar</button></td>
      `
		}
		orderItems.appendChild(row)
		updateTotal()
		addDeleteItemListener(row.querySelector(".delete-item"))
	}

	// Función para agregar bebida a la orden
	function addDrinkItem() {
		const row = document.createElement("tr")
		row.innerHTML = `
      <td><input type="number" class="quantity" value="1" min="1"></td>
      <td colspan="2">
          <select class="drink">
              ${Object.entries(drinkPrices)
				.map(([name, price]) => `<option value="${name}">${name} - $${formatCurrency(price)}</option>`)
				.join("")}
          </select>
      </td>
      <td class="item-total">$${formatCurrency(drinkPrices["limonada natural"])}</td>
      <td><button type="button" class="delete-item">Eliminar</button></td>
    `
		orderItems.appendChild(row)
		updateTotal()
		addDeleteItemListener(row.querySelector(".delete-item"))
	}

	// Función para agregar item de Didi a la orden
	function addDidiItem() {
		const row = document.createElement("tr")
		row.innerHTML = `
      <td><input type="number" class="quantity" value="1" min="1"></td>
      <td colspan="2">
          <input type="number" class="didi-number" placeholder="Número Didi">
      </td>
      <td>
          <input type="number" class="didi-value" placeholder="Valor Didi" min="0">
      </td>
      <td><button type="button" class="delete-item">Eliminar</button></td>
    `
		orderItems.appendChild(row)
		updateTotal()
		addDeleteItemListener(row.querySelector(".delete-item"))
	}

	// Función para agregar listener de eliminación a un item
	function addDeleteItemListener(deleteButton) {
		deleteButton.addEventListener("click", function () {
			this.closest("tr").remove()
			updateTotal()
		})
	}

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

	// SECCIÓN 6: FUNCIONES PARA COMPLETAR Y PREVISUALIZAR VALES
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

	// SECCIÓN 7: FUNCIONES DE UTILIDAD
	// Función para actualizar la fecha actual
	function updateCurrentDate() {
		const now = new Date()
		currentDateElement.textContent = now.toLocaleDateString()
	}

	// Función para actualizar el placeholder del número de cliente
	function updateCustomerNumberPlaceholder() {
		if (customerTypeSelect.value === "mesa") {
			customerNumberInput.placeholder = "M1-M6"
			customerNumberInput.required = true
		} else if (customerTypeSelect.value === "llevar") {
			customerNumberInput.placeholder = "0000"
			customerNumberInput.required = true
		} else if (customerTypeSelect.value === "didi") {
			customerNumberInput.placeholder = "Número Didi (opcional)"
			customerNumberInput.required = false
		}
	}

	// Función para mostrar/ocultar la entrada de domicilio
	function toggleDeliveryInput() {
		if (customerTypeSelect.value === "llevar") {
			deliveryContainer.style.display = "block"
		} else {
			deliveryContainer.style.display = "none"
		}
		updateTotal()
	}

	// Función para establecer el rango de vales
	function setValeRange() {
		const start = Number.parseInt(startVale.value)
		const end = Number.parseInt(endVale.value)
		if (!isNaN(start) && !isNaN(end) && start <= end) {
			currentVale = start
			valeNumber.textContent = currentVale.toString().padStart(4, "0")
			localStorage.setItem("valeRange", JSON.stringify({ start, end, current: currentVale }))
			updateOrderValeNumbers(start)
		} else {
			alert("Por favor, ingrese un rango de vales válido.")
		}
	}

	// Función para actualizar los números de vale de las órdenes
	function updateOrderValeNumbers(startValue) {
		const orders = JSON.parse(localStorage.getItem("orders")) || []
		orders.forEach((order, index) => {
			order.valeNumber = (startValue + index).toString().padStart(4, "0")
		})
		localStorage.setItem("orders", JSON.stringify(orders))
		displayOrders()
	}

	// Función para actualizar el contador diario
	function updateDailyCounter() {
		const today = new Date().toLocaleDateString()
		const orders = JSON.parse(localStorage.getItem("orders")) || []
		const todayOrders = orders.filter((order) => order.date === today)
		const counter = document.getElementById("dailyCounter")
		counter.textContent = `Vales del día: ${todayOrders.length}`
	}

	// SECCIÓN 8: INICIALIZACIÓN Y EVENT LISTENERS
	// Función de inicialización
	function init() {
		updateCurrentDate()
		setInterval(updateCurrentDate, 60000)
		updateCustomerNumberPlaceholder()
		toggleDeliveryInput()

		const savedValeRange = JSON.parse(localStorage.getItem("valeRange"))
		if (savedValeRange) {
			currentVale = savedValeRange.current
			valeNumber.textContent = currentVale.toString().padStart(4, "0")
			startVale.value = savedValeRange.start
			endVale.value = savedValeRange.end
		}

		displayOrders()
		updateDailyCounter()

		if (addPizzaButton) addPizzaButton.addEventListener("click", addPizzaItem)
		if (addDrinkButton) addDrinkButton.addEventListener("click", addDrinkItem)
		if (addDidiButton) addDidiButton.addEventListener("click", addDidiItem)
		if (pdfButton) pdfButton.addEventListener("click", generatePDF)
		if (printOrderButton) {
			printOrderButton.addEventListener("click", () => {
				const orderIndex = prompt("Ingrese el número de orden que desea imprimir:")
				if (orderIndex !== null) {
					printOrder(Number.parseInt(orderIndex) - 1)
				}
			})
		}
		if (financeButton) financeButton.addEventListener("click", showFinances)
		if (manageFlavorsButton) manageFlavorsButton.addEventListener("click", manageFlavors)
		if (setValeRangeButton) setValeRangeButton.addEventListener("click", setValeRange)
		if (customerTypeSelect) {
			customerTypeSelect.addEventListener("change", updateCustomerNumberPlaceholder)
			customerTypeSelect.addEventListener("change", toggleDeliveryInput)
		}
		if (deliveryTypeSelect) deliveryTypeSelect.addEventListener("change", updateTotal)
		if (completeValeButton) completeValeButton.addEventListener("click", completeVale)

		if (orderItems) orderItems.addEventListener("change", updateTotal)
		if (additionalAmountInput) additionalAmountInput.addEventListener("input", updateTotal)

		startVale.addEventListener("input", function () {
			const startValue = Number.parseInt(this.value)
			if (!isNaN(startValue)) {
				valeNumber.textContent = startValue.toString().padStart(4, "0")
				currentVale = startValue
			}
		})

		endVale.addEventListener("keypress", (e) => {
			if (e.key === "Enter") {
				e.preventDefault()
				setValeRange()
			}
		})

		customerTypeSelect.addEventListener("change", function () {
			if (this.value === "didi") {
				orderItems.querySelectorAll("tr").forEach((row) => {
					if (row.querySelector(".size")) {
						row.innerHTML = `
              <td><input type="number" class="quantity" value="1" min="1"></td>
              <td colspan="2">
                  <input type="number" class="didi-number" placeholder="Número Didi">
              </td>
              <td>
                  <input type="number" class="didi-value" placeholder="Valor Didi" min="0">
              </td>
              <td><button type="button" class="delete-item">Eliminar</button></td>
            `
						addDeleteItemListener(row.querySelector(".delete-item"))
					}
				})
			} else {
				orderItems.querySelectorAll("tr").forEach((row) => {
					if (row.querySelector(".didi-number")) {
						row.innerHTML = `
              <td><input type="number" class="quantity" value="1" min="1"></td>
              <td>
                  <select class="size">
                      ${Object.keys(pizzaPrices)
								.map((size) => `<option value="${size}">${size}</option>`)
								.join("")}
                  </select>
              </td>
              <td>
                  <select class="flavor">
                      ${pizzaFlavors.map((flavor) => `<option value="${flavor}">${flavor}</option>`).join("")}
                  </select>
              </td>
              <td class="item-total">$${formatCurrency(pizzaPrices.personal)}</td>
              <td><button type="button" class="delete-item">Eliminar</button></td>
            `
						addDeleteItemListener(row.querySelector(".delete-item"))
					}
				})
			}
			updateTotal()
		})

		// Agregar funcionalidad de Enter para botones vinculados a inputs
		document.querySelectorAll("input").forEach((input) => {
			input.addEventListener("keypress", function (e) {
				if (e.key === "Enter") {
					e.preventDefault()
					const form = this.closest("form")
					if (form) {
						const submitButton = form.querySelector('button[type="submit"]')
						if (submitButton) {
							submitButton.click()
						}
					}
				}
			})
		})
	}

	document.addEventListener("DOMContentLoaded", init)

	// SECCIÓN 9: MANEJO DE FORMULARIOS Y ÓRDENES
	orderForm.addEventListener("submit", (e) => {
		e.preventDefault()
		const order = {
			valeNumber: valeNumber.textContent,
			customerType: customerTypeSelect.value,
			customerNumber: customerNumberInput.value,
			items: Array.from(orderItems.querySelectorAll("tr"))
				.map((row) => {
					const quantityInput = row.querySelector(".quantity")
					const quantity = quantityInput ? Number.parseInt(quantityInput.value, 10) || 1 : 1

					if (row.querySelector(".size")) {
						const sizeSelect = row.querySelector(".size")
						const flavorSelect = row.querySelector(".flavor")
						const itemTotalElement = row.querySelector(".item-total")
						return {
							quantity: quantity,
							item: "Pizza " + (sizeSelect ? sizeSelect.value : ""),
							flavor: flavorSelect ? flavorSelect.value : "",
							total: itemTotalElement
								? Number.parseFloat(itemTotalElement.textContent.replace("$", "").replace(",", "")) || 0
								: 0,
						}
					} else if (row.querySelector(".drink")) {
						const drinkSelect = row.querySelector(".drink")
						const itemTotalElement = row.querySelector(".item-total")
						return {
							quantity: quantity,
							item: drinkSelect ? drinkSelect.value : "",
							total: itemTotalElement
								? Number.parseFloat(itemTotalElement.textContent.replace("$", "").replace(",", "")) || 0
								: 0,
						}
					} else if (row.querySelector(".didi-number")) {
						const didiNumberInput = row.querySelector(".didi-number")
						const didiValueInput = row.querySelector(".didi-value")
						return {
							quantity: quantity,
							item: "Didi " + (didiNumberInput ? didiNumberInput.value : ""),
							total: Number.parseFloat(didiValueInput ? didiValueInput.value : 0) || 0,
						}
					}
					return {}
				})
				.filter((item) => Object.keys(item).length > 0),
			total: Number.parseFloat(totalAmount.textContent.replace(",", "")) || 0,
			paymentMethod: document.getElementById("paymentMethod").value,
			phone: document.getElementById("phone").value,
			address: document.getElementById("address").value,
			date: currentDateElement.textContent,
			status: "pending",
			paid: false,
			tip: 0, // Inicializar propina a 0
		}

		if (customerTypeSelect.value === "llevar") {
			order.deliveryType = deliveryTypeSelect.value
		}
		// Propina voluntaria
		order.deliveryType = deliveryTypeSelect.value
		const voluntaryTip = document.getElementById("voluntaryTip").checked
		if (voluntaryTip && customerTypeSelect.value === "mesa") {
			const tipAmount = Math.round(order.total * 0.1)
			order.tip = tipAmount
			order.total += tipAmount
		}

		// Permitir guardar órdenes Didi sin requerir número de mesa o cliente
		if (customerTypeSelect.value === "didi" || customerNumberInput.value.trim() !== "") {
			saveOrder(order)
			orderForm.reset()
			orderItems.innerHTML = ""
			updateTotal()
			displayOrders()

			currentVale++
			valeNumber.textContent = currentVale.toString().padStart(4, "0")

			const valeRange = JSON.parse(localStorage.getItem("valeRange")) || {}
			if (currentVale <= valeRange.end) {
				localStorage.setItem("valeRange", JSON.stringify({ ...valeRange, current: currentVale }))
			} else {
				alert("Se ha alcanzado el final del rango de vales. Por favor, establezca un nuevo rango.")
			}
		} else {
			alert("Por favor, ingrese un número de mesa o cliente.")
		}
	})

	// SECCION DE EDITAR SABORES
	window.onclick = (event) => {

		const flavorModal = document.getElementById("flavorModal");

		if (event.target === editModal || event.target === flavorModal) {
			if (editModal) editModal.style.display = "none";
			if (flavorModal) flavorModal.style.display = "none";
		}
	};


	document.querySelectorAll(".close").forEach((closeButton) => {
		closeButton.onclick = () => {
			editModal.style.display = "none"
			flavorModal.style.display = "none"
		}
	})

	function closeModals() {
		editModal.style.display = "none"
		flavorModal.style.display = "none"
	}
	////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////

	// SECCIÓN 10: FUNCIONES FINANCIERAS Y DE GESTIÓN reporte financiero
	// Función para mostrar las finanzas
	// Funciones en el ámbito global// Función para formatear moneda
	function formatCurrency(value) {
		let numValue = typeof value === "string" ? Number.parseFloat(value.replace(/[^\d.-]/g, "")) : Number.parseFloat(value);
		if (isNaN(numValue)) return "0";
		numValue = Math.round(numValue);
		return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	function closeFinanceModal() {
		console.log('Cerrando modal');
		const modal = document.getElementById("financeModal");
		if (modal) {
			modal.style.display = "none";
		}
	}

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

	function agregarCampoCompra() {
		const container = document.getElementById('comprasContainer');
		const nuevoInput = document.createElement('input');
		nuevoInput.type = 'number';
		nuevoInput.className = 'compraInput';
		nuevoInput.placeholder = 'Monto de compra';
		container.appendChild(nuevoInput);
		nuevoInput.focus();
	}

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
                <h2>Reporte Financiero</h2>
                
                <div class="finance-section">
                    <p>Efectivo: <span id="totalEfectivo">$${formatCurrency(efectivo)}</span> (${efectivoCount} órdenes)</p>
                    <p>Nequi: <span id="totalNequi">$${formatCurrency(nequi)}</span> (${nequiCount} órdenes)</p>
                    <p>Daviplata: <span id="totalDaviplata">$${formatCurrency(daviplata)}</span> (${daviplataCount} órdenes)</p>
                    <p>QR: <span id="totalQR">$${formatCurrency(qr)}</span> (${qrCount} órdenes)</p>
                    <p>Tarjeta: <span id="totalTarjeta">$${formatCurrency(tarjeta)}</span> (${tarjetaCount} órdenes)</p>
                    <p class="total-line">Bancolombia: <span id="totalBancolombia">$${formatCurrency(bancolombia)}</span></p>
                    <p class="total-line">Total: <span id="totalGeneral">$${formatCurrency(total)}</span></p>
                </div>

                <div class="finance-section">
                    <h3>Inicio de caja:</h3>
                    <p>Efectivo: <input type="number" id="InCajaEfectivo" placeholder="Monto base de caja"></p>
                    <p>Nequi: <input type="number" id="InCajaNequi" placeholder="Monto base de caja"></p>
                    <p>Daviplata: <input type="number" id="InCajaDaviplata" placeholder="Monto base de caja"></p>
                    <p>Bancolombia: <input type="number" id="InCajaBancolombia" placeholder="Monto base de caja"></p>
                </div>

                <div class="finance-section">
                    <h3>Compras:</h3>
                    <div id="comprasContainer">
                        <input type="number" class="compraInput" placeholder="Monto de compra">
                    </div>
                </div>

                <div class="finance-section">
                    <h3>Pedidos Didi:</h3>
                    <p>Efectivo: <span id="didiEfectivo">${efectivoCount}</span></p>
                    <p>Nequi: <span id="didiNequi">${nequiCount}</span></p>
                    <p>Daviplata: <span id="didiDaviplata">${daviplataCount}</span></p>
                    <p>QR: <span id="didiQR">${qrCount}</span></p>
                    <p>Tarjeta: <span id="didiTarjeta">${tarjetaCount}</span></p>
                    <p class="total-line">Total Didi: <span id="totalDidi">$${formatCurrency(total)}</span></p>
                </div>

                <div class="finance-actions">
                    <button id="calcularTotalBtn" class="accept-button">Calcular Total</button>
                    <button id="cerrarModalBtn" class="cancel-button">Cerrar</button>
                </div>

                <div id="adjustedTotal" style="display: none;"></div>
            </div>
        </div>
    `;


		// Agregar el modal al body
		document.body.insertAdjacentHTML('beforeend', modalHTML);

		// Mostrar el modal
		const modal = document.getElementById("financeModal");
		modal.style.display = "block";

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

	// Estilos CSS para el modal
	const styles = `
    .modal {
        display: none;
        position: fixed;
        z-index: 1;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0,0,0,0.4);
    }

    .modal-content {
        background-color: #1a1a1a;
        margin: 3% auto;
        padding: 20px;
        border: 1px solid #888;
        width: 80%;
        max-width: 500px;
        color: white;
        border-radius: 8px;
    }

    .finance-section {
        margin-bottom: 20px;
    }

    .finance-section p {
        margin: 8px 0;
    }

    .total-line {
        border-top: 1px solid #333;
        padding-top: 8px;
        margin-top: 8px;
        font-weight: bold;
    }

    .finance-actions {
        margin-top: 20px;
    }

    input[type="number"] {
        width: 100%;
        padding: 8px;
        margin-bottom: 10px;
        background-color: #333;
        border: 1px solid #444;
        color: white;
        border-radius: 4px;
    }

    .button-group {
        display: flex;
        gap: 10px;
    }

    .accept-button, .cancel-button {
        flex: 1;
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .accept-button {
        background-color: #4a90e2;
        color: white;
    }

    .cancel-button {
        background-color: #666;
        color: white;
    }
`;
	const styleSheet = document.createElement("style");
	styleSheet.innerText = styles;
	document.head.appendChild(styleSheet);
	// Función para mostrar el reporte financiero
	function showFinanceReport() {
		showFinances();
	}

	// Puedes llamar a esta función cuando quieras mostrar el reporte financiero
	// Por ejemplo, podrías agregar un botón en tu HTML:
	// <button onclick="showFinanceReport()">Mostrar Reporte Financiero</button>

	// Función para mostrar el reporte cuando se necesite
	//showFinances();


	///////////////////////////////////////////7
	// Función para gestionar sabores y precios
	function manageFlavors() {
		const flavorManager = document.getElementById("flavorManager")
		if (!flavorManager) return

		flavorManager.innerHTML = `
      <div>
        <h3>Sabores de Pizza</h3>
        <ul id="pizzaFlavorList"></ul>
        <div>
          <input type="text" id="newPizzaFlavor" placeholder="Nuevo sabor">
          <button id="addPizzaFlavor">Agregar Sabor</button>
        </div>
        
        <h3>Bebidas</h3>
        <ul id="drinkList"></ul>
        <div>
          <input type="text" id="newDrinkName" placeholder="Nombre de la bebida">
          <input type="number" id="newDrinkPrice" placeholder="Precio">
          <button id="addDrink">Agregar Bebida</button>
        </div>
        
        <h3>Precios de Pizza</h3>
        <ul id="pizzaPriceList"></ul>
      </div>
    `

		const pizzaFlavorList = document.getElementById("pizzaFlavorList")
		const drinkList = document.getElementById("drinkList")
		const pizzaPriceList = document.getElementById("pizzaPriceList")

		function updatePizzaFlavorList() {
			pizzaFlavorList.innerHTML = ""
			pizzaFlavors.forEach((flavor) => {
				const li = document.createElement("li")
				li.textContent = flavor
				const deleteButton = document.createElement("button")
				deleteButton.textContent = "Eliminar"
				deleteButton.onclick = () => {
					pizzaFlavors = pizzaFlavors.filter((f) => f !== flavor)
					updatePizzaFlavorList()
					localStorage.setItem("pizzaFlavors", JSON.stringify(pizzaFlavors))
				}
				li.appendChild(deleteButton)
				pizzaFlavorList.appendChild(li)
			})
		}

		function updateDrinkList() {
			drinkList.innerHTML = ""
			Object.entries(drinkPrices).forEach(([name, price]) => {
				const li = document.createElement("li")
				li.textContent = `${name}: $${formatCurrency(price)}`
				const deleteButton = document.createElement("button")
				deleteButton.textContent = "Eliminar"
				deleteButton.onclick = () => {
					delete drinkPrices[name]
					updateDrinkList()
					localStorage.setItem("drinkPrices", JSON.stringify(drinkPrices))
				}
				li.appendChild(deleteButton)
				drinkList.appendChild(li)
			})
		}

		function updatePizzaPriceList() {
			pizzaPriceList.innerHTML = ""
			Object.entries(pizzaPrices).forEach(([size, price]) => {
				const li = document.createElement("li")
				li.textContent = `${size}: $${formatCurrency(price)}`
				const input = document.createElement("input")
				input.type = "number"
				input.value = price
				input.onchange = (e) => {
					pizzaPrices[size] = Number.parseFloat(e.target.value)
					updatePizzaPriceList()
					localStorage.setItem("pizzaPrices", JSON.stringify(pizzaPrices))
				}
				li.appendChild(input)
				pizzaPriceList.appendChild(li)
			})
		}

		updatePizzaFlavorList()
		updateDrinkList()
		updatePizzaPriceList()

		document.getElementById("addPizzaFlavor").onclick = () => {
			const newFlavor = document.getElementById("newPizzaFlavor").value
			if (newFlavor && !pizzaFlavors.includes(newFlavor)) {
				pizzaFlavors.push(newFlavor)
				updatePizzaFlavorList()
				document.getElementById("newPizzaFlavor").value = ""
				localStorage.setItem("pizzaFlavors", JSON.stringify(pizzaFlavors))
			}
		}

		document.getElementById("addDrink").onclick = () => {
			const newDrinkName = document.getElementById("newDrinkName").value
			const newDrinkPrice = Number.parseFloat(document.getElementById("newDrinkPrice").value)
			if (newDrinkName && !isNaN(newDrinkPrice)) {
				drinkPrices[newDrinkName] = newDrinkPrice
				updateDrinkList()
				document.getElementById("newDrinkName").value = ""
				document.getElementById("newDrinkPrice").value = ""
				localStorage.setItem("drinkPrices", JSON.stringify(drinkPrices))
			}
		}

		flavorModal.style.display = "block"
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
        </html>
      `)
			printWindow.document.close()
			printWindow.print()
		}
	}

	// Función para generar PDF
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
	function addVoluntaryTip(orderId) {
		const orders = JSON.parse(localStorage.getItem("orders")) || []
		const orderIndex = orders.findIndex((order) => order.valeNumber === orderId)

		if (orderIndex !== -1) {
			const tipAmount = Number.parseFloat(prompt("Ingrese el valor de la propina:"))
			if (!isNaN(tipAmount) && tipAmount >= 0) {
				orders[orderIndex].tip = tipAmount
				localStorage.setItem("orders", JSON.stringify(orders))
				displayOrders()
			} else {
				alert("Por favor, ingrese un valor de propina válido.")
			}
		} else {
			alert(`No se encontró la orden con el ID ${orderId}.`)
		}
	}

	init()
})

