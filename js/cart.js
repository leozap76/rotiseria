let cart = JSON.parse(localStorage.getItem('pedido')) || [];

function addToCart(id) {
    const prod = productos.find(p => p.id === id);
    const exists = cart.find(item => item.id === id);
    if (exists) exists.cantidad++;
    else cart.push({ ...prod, cantidad: 1 });
    saveAndRefresh();
}

function saveAndRefresh() {
    localStorage.setItem('pedido', JSON.stringify(cart));
    updateUI(); 
}

function changeQuantity(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.cantidad += delta;
        if (item.cantidad <= 0) cart = cart.filter(i => i.id !== id);
        saveAndRefresh();
        renderCartList();
    }
}

function iniciarCheckout() {
    toggleCheckout(true); 
}

// NUEVA FUNCIÓN DE VALIDACIÓN
function procesarEnvioWhatsApp() {
    try {
        if (!checkStoreStatus()) {
            alert("El local se encuentra cerrado en este momento. Intenta de nuevo más tarde.");
            return;
        }

        const nombreElement = document.getElementById('cust-name');
        const direccionElement = document.getElementById('cust-address');
        const pagoElement = document.getElementById('cust-payment');

        if (!nombreElement || !direccionElement || !pagoElement) {
            alert("Error en el formulario. Faltan campos.");
            return;
        }

        const nombre = nombreElement.value.trim();
        const direccion = direccionElement.value.trim();
        const pago = pagoElement.value;

        if (!nombre || !direccion) {
            alert("Por favor, completa tu nombre y dirección.");
            return;
        }

        finalizarPedido({ nombre, direccion, pago });
    } catch (error) {
        alert("Error técnico: " + error.message);
        console.error("Error al enviar WhatsApp:", error);
    }
}
function finalizarPedido(datosCliente) {
    const { nombre, direccion, pago } = datosCliente;
    
    const zoneSelect = document.getElementById('cust-zone');
    const zonaTexto = zoneSelect.options[zoneSelect.selectedIndex].text;
    const costoEnvio = parseInt(zoneSelect.options[zoneSelect.selectedIndex].getAttribute('data-costo') || 0);

    let mensaje = `*NUEVO PEDIDO - ${TIENDA_CONFIG.nombre}*%0A`;
    mensaje += `--------------------------%0A`;
    mensaje += `*Cliente:* ${nombre}%0A`;
    mensaje += `*Entrega:* ${direccion}%0A`;
    mensaje += `*Zona:* ${zonaTexto}%0A`;
    mensaje += `*Pago:* ${pago}%0A`;
    mensaje += `--------------------------%0A%0A`;
    
    let subtotal = 0;
    cart.forEach(item => {
        const sub = item.precio * item.cantidad;
        subtotal += sub;
        mensaje += `• ${item.cantidad}x ${item.nombre} ($${sub.toLocaleString()})%0A`;
    });

    const totalFinal = subtotal + costoEnvio;
    
    mensaje += `%0A--------------------------%0A`;
    mensaje += `*Subtotal:* $${subtotal.toLocaleString()}%0A`;
    mensaje += `*Envío:* $${costoEnvio.toLocaleString()}%0A`;
    mensaje += `*TOTAL A PAGAR: $${totalFinal.toLocaleString()}*%0A`;
    mensaje += `--------------------------`;
    
    window.open(`https://wa.me/${TIENDA_CONFIG.telefono}?text=${mensaje}`, '_blank');
}