import { showFinances, showFinanceReport, formatCurrency } from './finance.js';
import {
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
} from './orders.js';
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

	/////////////////////////////////////////////////
	// SECCIÓN 3: FUNCIONES AUXILIARES
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

	/////// 5:
	//6:

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
	/////////////////////////10:///////////////////////////////
	/////////////////////////////////////////////////////////

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
	init()
})

