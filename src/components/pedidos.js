import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, message } from 'antd';
import axios from 'axios';

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [detalleVisible, setDetalleVisible] = useState(false);
  const [detalleProductos, setDetalleProductos] = useState([]);

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
      key: 'detalle',
      render: (text, record) => (
        <>
          <Button type="primary" onClick={() => handleMostrarDetalle(record)}>Detalle</Button>
          <Button type="primary" style={{marginLeft:'5px'}} danger onClick={() => handleEliminarPedido(record)}>Eliminar</Button>
        </>
      ),
    },
  ];

  const handleMostrarDetalle = (record) => {
    setDetalleProductos(record.productosSeleccionados);
    setDetalleVisible(true);
  };

  const handleCerrarDetalle = () => {
    setDetalleVisible(false);
  };

  const handleEliminarPedido = async (record) => {
    try {
      await axios.delete(`https://bishoku-back.vercel.app/api/pedidos/${record._id}`);
      message.success('Pedido eliminado correctamente');
      // Actualizar la lista de pedidos después de eliminar
      const updatedPedidos = pedidos.filter((pedido) => pedido._id !== record._id);
      setPedidos(updatedPedidos);
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
      message.error('Error al eliminar el pedido');
    }
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
          {detalleProductos.map((producto) => (
            <li key={producto._id}>
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