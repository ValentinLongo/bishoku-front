import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Form, Typography, Modal } from 'antd';
import axios from 'axios';

const { Text } = Typography;

const NuevoPedido = () => {
  const [productos, setProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ubicacion, setUbicacion] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalProductos, setModalProductos] = useState([]);
  const [modalProductosSeleccionados, setModalProductosSeleccionados] = useState([]);
  const [busquedaDescripcion, setBusquedaDescripcion] = useState('');
  const [comboId, setComboId] = useState('');
  const [comboPrecio, setComboPrecio] = useState(0);
  const [comboDescripcion, setComboDescripcion] = useState('');
  const [comboSubproductos, setComboSubproductos] = useState([]); // Estado para los subproductos del Combo

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://bishoku-back.vercel.app/api/productos');
        setProductos(response.data);
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    };

    fetchData();
  }, []);

  const handleAgregarProducto = (item) => {
    if (typeof item === 'number') {
      if (ubicacion.includes(item)) {
        const updatedUbicacion = ubicacion.filter((ubic) => ubic !== item);
        setUbicacion(updatedUbicacion);
      } else {
        setUbicacion([...ubicacion, item]);
      }
    } else {
      if (item.categoria === 'Combo') {
        setModalProductos(
          productos.filter((producto) => producto.categoria === 'Sushi')
        );
        setModalProductosSeleccionados([]);
        setModalVisible(true);
        setComboId(item._id);
        setComboPrecio(item.precio);
        setComboDescripcion(item.descripcion);
        setComboSubproductos([]); // Limpiar los subproductos al seleccionar un nuevo Combo
      } else {
        setProductosSeleccionados([...productosSeleccionados, item]);
      }
    }
  };

  const handleEliminarProducto = (record) => {
    const updatedProductosSeleccionados = productosSeleccionados.filter(
      (producto) => producto._id !== record._id
    );
    setProductosSeleccionados(updatedProductosSeleccionados);
  };

  const handleAgregarSubProducto = (item) => {
    setComboSubproductos([...comboSubproductos, item]); // Agregar subproducto al Combo seleccionado
    setModalProductosSeleccionados([...modalProductosSeleccionados, item]);
  };

  const handleGuardarSubProductos = () => {
    setModalVisible(false);

    const productoComboIndex = productosSeleccionados.findIndex(
      (producto) => producto.categoria === 'Combo'
    );

    if (productoComboIndex !== -1) {
      const productoCombo = productosSeleccionados[productoComboIndex];
      productoCombo.subproductos = comboSubproductos; // Asignar los subproductos al Combo en productosSeleccionados
      const updatedProductosSeleccionados = [...productosSeleccionados];
      updatedProductosSeleccionados[productoComboIndex] = productoCombo;
      setProductosSeleccionados(updatedProductosSeleccionados);
    } else {
      const productoCombo = {
        _id: comboId,
        descripcion: comboDescripcion,
        precio: comboPrecio,
        subproductos: comboSubproductos,
      };
      setProductosSeleccionados([...productosSeleccionados, productoCombo]);
    }

    setModalProductosSeleccionados([]);
  };

  const calcularPrecioTotal = () => {
    return productosSeleccionados.reduce((total, producto) => total + producto.precio, 0);
  };

  const generarHTMLPedido = () => {
    const productosHTML = productosSeleccionados.map((producto) => `
      <tr>
        <td>${producto.descripcion}</td>
        <td>$${producto.precio}</td>
      </tr>
    `).join('');

    const subproductosHTML = comboSubproductos.map((subproducto) => `
      <tr>
        <td>${subproducto.descripcion}</td>
        <td>0</td>
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
          <p><strong>Dirección:</strong> ${direccion}</p>
          <p><strong>Ubicación:</strong> ${ubicacion.join(', ')}</p>
          <h2>Productos Seleccionados</h2>
          <table>
            <tr>
              <th>Descripción</th>
              <th>Precio</th>
            </tr>
            ${productosHTML}
          </table>
          <h2>Subproductos del Combo</h2>
          <table>
            <tr>
              <th>Descripción</th>
              <th>Precio</th>
            </tr>
            ${subproductosHTML}
          </table>
          <p><strong>Total:</strong> $${calcularPrecioTotal()}</p>
        </div>
      </body>
      </html>
    `;

    return html;
  };

  const handleGuardarPedido = async () => {
    try {
      const nuevoPedido = {
        nombre,
        direccion,
        ubicacion,
        productosSeleccionados,
        precioTotal: calcularPrecioTotal(),
      };
      const response = await axios.post('https://bishoku-back.vercel.app/api/pedidos', nuevoPedido);
      console.log('Pedido guardado:', response.data);
      setModalVisible(true);
      setNombre('');
      setDireccion('');
      setUbicacion([]);
      setProductosSeleccionados([]);

      const htmlPedido = generarHTMLPedido();
      const ventanaImpresion = window.open('', '_blank');
      ventanaImpresion.document.write(htmlPedido);
      ventanaImpresion.document.close();
      ventanaImpresion.onload = () => {
        ventanaImpresion.print();
        ventanaImpresion.close();
      };
    } catch (error) {
      console.error('Error al guardar el pedido:', error);
    }
  };

  const handleAgregarRetiro = () => {
    setUbicacion([...ubicacion, 'Retiro']);
  };

  const handleAceptarModal = () => {
    setModalVisible(false);
    window.location.reload();
  };

  const columns = [
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
    },
    {
      title: 'Precio',
      dataIndex: 'precio',
      key: 'precio',
      render: (text, record) => `$${text}`,
    },
    {
      title: 'Acción',
      key: 'action',
      render: (text, record) => (
        <Button type="primary" onClick={() => handleAgregarProducto(record)}>
          Agregar
        </Button>
      ),
    },
  ];

  const productosSeleccionadosColumns = [
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
    },
    {
      title: 'Precio',
      dataIndex: 'precio',
      key: 'precio',
      render: (text, record) => `$${text}`,
    },
    {
      title: 'Acción',
      key: 'action',
      render: (text, record) => (
        <Button type="primary" danger onClick={() => handleEliminarProducto(record)}>
          Eliminar
        </Button>
      ),
    },
  ];

  const modalColumns = [
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
    },
    {
      title: 'Precio',
      dataIndex: 'precio',
      key: 'precio',
      render: (text, record) => `$${text}`,
    },
    {
      title: 'Acción',
      key: 'action',
      render: (text, record) => (
        <Button type="primary" onClick={() => handleAgregarSubProducto(record)}>
          Agregar
        </Button>
      ),
    },
  ];

  const renderBotonesNumerados = () => {
    return (
      <>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item, index) => (
          <Button
            key={index}
            style={{ marginRight: '8px', marginBottom: '8px', backgroundColor: ubicacion.includes(item) ? 'green' : '' }}
            onClick={() => handleAgregarProducto(item)}
          >
            {item}
          </Button>
        ))}
        <Button
          style={{ marginRight: '8px', marginBottom: '8px', backgroundColor: ubicacion.includes('Retiro') ? 'green' : '' }}
          onClick={handleAgregarRetiro}
        >
          Retiro
        </Button>
      </>
    );
  };

  return (
    <div style={{ margin: '15px' }}>
      <h1>Carga de Nuevo Pedido</h1>
      <Form>
        <Form.Item label="Nombre">
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </Form.Item>
        <Form.Item label="Dirección">
          <Input value={direccion} onChange={(e) => setDireccion(e.target.value)} />
        </Form.Item>
      </Form>
      {renderBotonesNumerados()}
      <Table
        dataSource={productos.filter(producto => producto.descripcion.toLowerCase().includes(busquedaDescripcion.toLowerCase()))}
        columns={columns}
        rowKey="_id"
      />
      <h2>Productos Seleccionados</h2>
      <Table
        dataSource={productosSeleccionados}
        columns={productosSeleccionadosColumns}
        rowKey="_id"
        pagination={false}
        footer={() => (
          <>
            <Text strong>Total:</Text>
            <Text type="success" strong style={{ marginLeft: '8px' }}>
              {`$${calcularPrecioTotal()}`}
            </Text>
            <Button type="primary" onClick={handleGuardarPedido} style={{ marginLeft: '16px' }}>
              Guardar Pedido
            </Button>
          </>
        )}
      />
      <Modal
        title="Seleccionar Subproducto"
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
        <Form.Item label="Buscar: ">
          <Input value={busquedaDescripcion} onChange={(e) => setBusquedaDescripcion(e.target.value)} />
        </Form.Item>
        <Table
          dataSource={modalProductos.filter(producto => producto.descripcion.toLowerCase().includes(busquedaDescripcion.toLowerCase()))}
          columns={modalColumns}
          rowKey="_id"
        />
        <h3>Subproductos Seleccionados:</h3>
        <ul>
          {modalProductosSeleccionados.map((subproducto) => (
            <li key={subproducto._id}>{subproducto.descripcion}</li>
          ))}
        </ul>
      </Modal>
    </div>
  );
};

export default NuevoPedido;