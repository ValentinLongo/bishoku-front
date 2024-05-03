import React, { useState, useEffect } from "react";
import { Button, Table, Modal, Input } from "antd";

const Asientos = () => {
  const [asientosSeleccionados, setAsientosSeleccionados] = useState([]);
  const [mesasActivas, setMesasActivas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalProductos, setModalProductos] = useState([]);
  const [modalProductosSeleccionados, setModalProductosSeleccionados] = useState([]);
  const [busquedaDescripcion, setBusquedaDescripcion] = useState('');
  const [detalleVisible, setDetalleVisible] = useState(false);
  const [detalleProductos, setDetalleProductos] = useState([]);
  const [mesaSeleccionadaId, setMesaSeleccionadaId] = useState(null);

  useEffect(() => {
    fetch("https://bishoku-back.vercel.app/api/mesas")
      .then((response) => response.json())
      .then((data) => setMesasActivas(data))
      .catch((error) => console.error("Error fetching data:", error));

    fetch("https://bishoku-back.vercel.app/api/productos")
      .then((response) => response.json())
      .then((data) => setModalProductos(data))
      .catch((error) => console.error("Error fetching productos:", error));
  }, []);

  const handleSeleccionarAsiento = (asiento) => {
    const asientoIndex = asientosSeleccionados.indexOf(asiento);
    if (asientoIndex !== -1) {
      const nuevosAsientos = [...asientosSeleccionados];
      nuevosAsientos.splice(asientoIndex, 1);
      setAsientosSeleccionados(nuevosAsientos);
    } else {
      setAsientosSeleccionados([...asientosSeleccionados, asiento]);
    }
  };

  const handleMostrarDetalle = (record) => {
    setDetalleProductos(record.productosSeleccionados);
    setDetalleVisible(true);
  };

  const handleCerrarDetalle = () => {
    setDetalleVisible(false);
  };

  const columns = [
    {
      title: "Ubicación",
      dataIndex: "ubicacion",
      key: "ubicacion",
      render: (text, record) => {
        return text.join(" - "); // Une las ubicaciones con un guión
      },
    },
    {
      title: "Detalle",
      key: "detalle",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleMostrarDetalle(record)}>
          Detalle
        </Button>
      ),
    },
    {
      title: "Agregar Producto",
      key: "agregarProducto",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleAgregarProducto(record._id)}>
          Agregar
        </Button>
      ),
    },
    {
      title: "Cerrar Mesa",
      key: "cerrarMesa",
      render: (_, record) => (
        <Button type="primary" danger onClick={() => handleCerrarMesa(record._id)}>
          Cerrar Mesa
        </Button>
      ),
    },
  ];

  const handleAgregarProducto = (mesaId) => {
    setMesaSeleccionadaId(mesaId);
    setModalVisible(true); // Abre el modal al hacer clic en "Agregar Producto"
    setModalProductosSeleccionados([]); // Limpia los productos seleccionados en el modal
  };

  const handleCerrarMesa = async (mesaId) => {
    try {
      // Actualizar la lista de mesas activas después del cierre
      const fetchMesasActivas = fetch("https://bishoku-back.vercel.app/api/mesas")
        .then((response) => response.json())
        .then((data) => {
          setMesasActivas(data);
          return data;
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          throw error;
        });


      // Actualizar los detalles de los productos antes de imprimir
      const mesaData = await fetchMesasActivas;
      console.log('MesaData: ', mesaData);
      const mesaEncontrada = mesaData.find((mesa) => mesa._id === mesaId);
      let imprimir = mesaEncontrada;

      const response = await fetch(`https://bishoku-back.vercel.app/api/mesas/cerrarMesa/${mesaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mesaId }),
      });
      console.log(response.data);

      const nuevoPedido = {
        nombre: 'Bishoku',
        direccion: 'Local',
        ubicacion: imprimir.ubicacion,
        productosSeleccionados: imprimir.productosSeleccionados,
        precioTotal: calcularPrecioTotal(imprimir),
      };

      const response2 = await fetch('https://bishoku-back.vercel.app/api/pedidos', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoPedido),
      });
      console.log(response2.data);

      const htmlPedido = generarHTMLPedido(imprimir);
      const ventanaImpresion = window.open("", "_blank");
      ventanaImpresion.document.write(htmlPedido);
      ventanaImpresion.document.close();
      ventanaImpresion.onload = () => {
        ventanaImpresion.print();
        ventanaImpresion.close();
      };
      window.location.reload();
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
    }
  };

  const generarHTMLPedido = (imprimir) => {
    console.log('imprimir desde generar', imprimir);
    const nombre = "Bishoku";
    const ubicacion = imprimir.ubicacion.map((asiento) => `${asiento}`).join(', ');

    const productosHTML = imprimir.productosSeleccionados.map((producto) => `
      <tr>
        <td>${producto.descripcion}</td>
        <td>$${producto.precio}</td>
      </tr>
    `).join('');


    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Imprimir Pedido</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 80mm;
            padding: 10px;
            border: 1px solid #000;
          }
          h1, h2 {
            text-align: center;
            margin-bottom: 10px;
          }
          p {
            margin: 5px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #000;
            padding: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>BISHOKU</h1>
          <h2>Datos del Cliente</h2>
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Ubicación:</strong> ${ubicacion}</p>
          <h2>Productos Seleccionados</h2>
          <table>
            <tr>
              <th>Descripción</th>
              <th>Precio</th>
            </tr>
            ${productosHTML}
          </table>
          <p><strong>Total:</strong> $${calcularPrecioTotal(imprimir)}</p>
        </div>
      </body>
      </html>
    `;

    return html;
  };

  const calcularPrecioTotal = (imprimir) => {
    return imprimir.productosSeleccionados.reduce((total, producto) => total + producto.precio, 0);
  };

  const handleSubmit = async () => {
    const nuevaMesa = {
      ubicacion: asientosSeleccionados.map((asiento) => `${asiento}`),
      estado: true,
      productosSeleccionados: [],
      precioTotal: 0,
    };

    try {
      const response = await fetch("https://bishoku-back.vercel.app/api/mesas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevaMesa),
      });

      if (response.ok) {
        console.log("Nueva mesa creada correctamente");
        // Recargar la página después del éxito del POST
        window.location.reload();
      } else {
        console.error("Error al crear la mesa:", response.statusText);
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
    }
  };

  const modalColumns = [
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
    },
    {
      title: "Precio",
      dataIndex: "precio",
      key: "precio",
      render: (text, record) => `$${text}`,
    },
    {
      title: "Acción",
      key: "action",
      render: (text, record) => (
        <Button type="primary" onClick={() => handleAgregarSubProducto(record)}>
          Agregar
        </Button>
      ),
    },
  ];

  const handleAgregarSubProducto = (item) => {
    setModalProductosSeleccionados([...modalProductosSeleccionados, item]);
  };

  const handleGuardarSubProductos = async () => {
    try {
      const mesaId = mesaSeleccionadaId; // Reemplaza esto con el ID de la mesa que deseas actualizar
      const response = await fetch(`https://bishoku-back.vercel.app/api/mesas/${mesaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productosSeleccionados: modalProductosSeleccionados }),
      });

      if (response.ok) {
        const mesaEncontrada = mesasActivas.find((mesa) => mesa._id === mesaId);
        let imprimir = mesaEncontrada;
        const imp = {
          nombre: 'Parcial',
          productosSeleccionados: modalProductosSeleccionados,
          ubicacion: imprimir.ubicacion
        }
        const htmlPedido = generarHTMLPedido(imp);
        const ventanaImpresion = window.open("", "_blank");
        ventanaImpresion.document.write(htmlPedido);
        ventanaImpresion.document.close();
        ventanaImpresion.onload = () => {
          ventanaImpresion.print();
          ventanaImpresion.close();
        };

        setMesaSeleccionadaId(null);
        console.log('Productos seleccionados guardados en la mesa correctamente');
        setModalVisible(false);
        window.location.reload();
      } else {
        console.error('Error al guardar productos seleccionados:', response.statusText);
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
    }
  };



  return (
    <div style={{ margin: "15px" }}>
      <h2>Selecciona tus asientos:</h2>
      <div className="asientos-container" style={{ display: "flex", justifyContent: "space-around" }}>
        {[...Array(12)].map((_, index) => (
          <Button
            key={index + 1}
            className={`asiento ${asientosSeleccionados.includes(index + 1) ? "asiento-seleccionado" : ""}`}
            onClick={() => handleSeleccionarAsiento(index + 1)}
            style={{ backgroundColor: asientosSeleccionados.includes(index + 1) ? "green" : "", color: asientosSeleccionados.includes(index + 1) ? "white" : "", height: "70px", width: "70px" }}
          >
            {index + 1}
          </Button>
        ))}
      </div>
      <Button type="primary" onClick={handleSubmit} style={{ marginTop: "20px" }}>
        Crear Mesa
      </Button>
      <h3>Mesas activas:</h3>
      <Table dataSource={mesasActivas} columns={columns} />
      <Modal
        title="Seleccionar Producto"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancelar" onClick={() => setModalVisible(false)}>
            Cancelar
          </Button>,
          <Button key="aceptar" type="primary" onClick={handleGuardarSubProductos}>
            Aceptar
          </Button>,
        ]}
      >
        <Input value={busquedaDescripcion} onChange={(e) => setBusquedaDescripcion(e.target.value)} />
        <Table
          dataSource={modalProductos.filter(producto => producto.descripcion.toLowerCase().includes(busquedaDescripcion.toLowerCase()))}
          columns={modalColumns}
          rowKey="_id"
        />
        <h3>Productos Seleccionados:</h3>
        <ul>
          {modalProductosSeleccionados.map((producto) => (
            <li key={producto._id}>{producto.descripcion}</li>
          ))}
        </ul>
      </Modal>
      <Modal
        title="Detalle de Productos"
        visible={detalleVisible}
        onCancel={handleCerrarDetalle}
        footer={null}
      >
        <ul>
          {detalleProductos.map((producto, index) => (
            <li key={`${producto._id}-${index}`}>
              <p>{producto.descripcion}</p>
              <p>Precio: ${producto.precio}</p>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
};

export default Asientos;