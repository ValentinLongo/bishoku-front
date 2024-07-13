import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, message } from 'antd';
import axios from 'axios';

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [detalleVisible, setDetalleVisible] = useState(false);
  const [detalleProductos, setDetalleProductos] = useState([]);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pedidoAEliminar, setPedidoAEliminar] = useState(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await axios.get('https://bishoku-back.vercel.app/api/pedidos');
        const pedidosOrdenados = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setPedidos(pedidosOrdenados);
      } catch (error) {
        console.error('Error al obtener pedidos:', error);
      }
    };

    fetchPedidos();
  }, []);

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
    },
    {
      title: 'Dirección',
      dataIndex: 'direccion',
      key: 'direccion',
    },
    {
      title: 'Ubicación',
      dataIndex: 'ubicacion',
      key: 'ubicacion',
    },
    {
      title: 'Precio Total',
      dataIndex: 'precioTotal',
      key: 'precioTotal',
      render: (text) => `$${text}`,
    },
    {
      title: 'Opciones',
      key: 'opciones',
      render: (text, record) => (
        <>
          <Button type="primary" onClick={() => handleMostrarDetalle(record)}>Detalle</Button>
          <Button type="primary" style={{ marginLeft: '5px', backgroundColor: 'green' }} onClick={() => handleImprimir(record)}>Imprimir</Button>
        </>
      ),
    },
  ];

  const handleMostrarDetalle = (record) => {
    console.log(record);
    setDetalleProductos(record.productosSeleccionados);
    setDetalleVisible(true);
  };

  const handleCerrarDetalle = () => {
    setDetalleVisible(false);
  };

  const handleImprimir = (imprimir) => {
    const htmlPedido = generarHTMLPedido(imprimir);
    const ventanaImpresion = window.open("", "_blank");
    ventanaImpresion.document.write(htmlPedido);
    ventanaImpresion.document.close();
    ventanaImpresion.onload = () => {
      ventanaImpresion.print();
      ventanaImpresion.close();
    };
  };

  

  const calcularPrecioTotal = (imprimir) => {
    return imprimir.productosSeleccionados.reduce((total, producto) => total + producto.precio, 0);
  };

  const generarHTMLPedido = (imprimir) => {
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
          <p><strong>Nombre:</strong> ${imprimir.nombre}</p>
          <p><strong>Dirección:</strong> ${imprimir.direccion}</p>
          <p><strong>Ubicación:</strong> ${imprimir.ubicacion.join(', ')}</p>
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

  return (
    <div>
      <h1>Página de Pedidos</h1>
      <Table dataSource={pedidos} columns={columns} rowKey="_id" />

      <Modal
        title="Detalle de Productos"
        visible={detalleVisible}
        footer={null}
        onCancel={handleCerrarDetalle}
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

export default Pedidos;