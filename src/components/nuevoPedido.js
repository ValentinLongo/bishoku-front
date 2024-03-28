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
      setUbicacion([...ubicacion, item]);
    } else {
      setProductosSeleccionados([...productosSeleccionados, item]);
    }
  };

  const handleEliminarProducto = (record) => {
    const updatedProductosSeleccionados = productosSeleccionados.filter(
      (producto) => producto._id !== record._id
    );
    setProductosSeleccionados(updatedProductosSeleccionados);
  };

  const calcularPrecioTotal = () => {
    return productosSeleccionados.reduce((total, producto) => total + producto.precio, 0);
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
    } catch (error) {
      console.error('Error al guardar el pedido:', error);
    }
  };

  const handleAgregarRetiro = () => {
    setUbicacion([...ubicacion, 'Retiro']);
  };

  const handleAceptarModal = () => {
    setModalVisible(false);
    window.location.reload(); // Refrescar la página
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
    <div>
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
      <Table dataSource={productos} columns={columns} rowKey="_id" />
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
        title="Pedido guardado"
        visible={modalVisible}
        footer={[
          <Button key="aceptar" type="primary" onClick={handleAceptarModal}>
            Aceptar
          </Button>,
        ]}
      >
        <p>El pedido se ha guardado correctamente.</p>
      </Modal>
    </div>
  );
};

export default NuevoPedido;