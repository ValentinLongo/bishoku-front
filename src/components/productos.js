import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Input, InputNumber } from 'antd';
import axios from 'axios';

const Productos = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoProductoDescripcion, setNuevoProductoDescripcion] = useState('');
  const [nuevoProductoPrecio, setNuevoProductoPrecio] = useState(0);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [productoEditandoId, setProductoEditandoId] = useState(null);
  const [productos, setProductos] = useState([]);

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

  const handleNuevoProducto = () => {
    setModalVisible(true);
    setProductoEditandoId(null);
    setNuevoProductoDescripcion('');
    setNuevoProductoPrecio(0);
    setNuevaCategoria('');
  };

  const handleEditarProducto = (id) => {
    setModalVisible(true);
    setProductoEditandoId(id);
    const productoEditando = productos.find((producto) => producto._id === id);
    setNuevoProductoDescripcion(productoEditando.descripcion);
    setNuevoProductoPrecio(productoEditando.precio);
    setNuevaCategoria(productoEditando.categoria || ''); // Manejar el caso de que el producto no tenga categoría
  };

  const handleAceptar = async () => {
    try {
      if (productoEditandoId) {
        await axios.put(`https://bishoku-back.vercel.app/api/productos/${productoEditandoId}`, {
          descripcion: nuevoProductoDescripcion,
          precio: nuevoProductoPrecio,
          categoria: nuevaCategoria,
        });
      } else {
        await axios.post('https://bishoku-back.vercel.app/api/productos', {
          descripcion: nuevoProductoDescripcion,
          precio: nuevoProductoPrecio,
          categoria: nuevaCategoria,
        });
      }

      setModalVisible(false);
      setNuevoProductoDescripcion('');
      setNuevoProductoPrecio(0);
      setProductoEditandoId(null);
      setNuevaCategoria('');
      const response = await axios.get('https://bishoku-back.vercel.app/api/productos');
      setProductos(response.data);
    } catch (error) {
      console.error('Error al guardar producto:', error);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await axios.delete(`https://bishoku-back.vercel.app/api/productos/${id}`);
      const response = await axios.get('https://bishoku-back.vercel.app/api/productos');
      setProductos(response.data);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
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
      title: 'Categoría',
      dataIndex: 'categoria',
      key: 'categoria',
    },
    {
      title: 'Acciones',
      key: 'action',
      align: 'right',
      render: (text, record) => (
        <Space size="small">
          <Button type="primary" onClick={() => handleEditarProducto(record._id)}>
            Editar
          </Button>
          <Button type="primary" danger onClick={() => handleEliminar(record._id)}>
            Borrar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" onClick={handleNuevoProducto}>
        Nuevo Producto
      </Button>
      <Table dataSource={productos} columns={columns} />
      <Modal
        title={productoEditandoId ? 'Editar Producto' : 'Nuevo Producto'}
        visible={modalVisible}
        onOk={handleAceptar}
        onCancel={() => {
          setModalVisible(false);
          setNuevoProductoDescripcion('');
          setNuevoProductoPrecio(0);
          setProductoEditandoId(null);
          setNuevaCategoria('');
        }}
      >
        <Input
          placeholder="Ingrese la descripción del producto"
          value={nuevoProductoDescripcion}
          onChange={(e) => setNuevoProductoDescripcion(e.target.value)}
        />
        <br />
        <br />
        <InputNumber
          placeholder="Ingrese el precio del producto"
          value={nuevoProductoPrecio}
          onChange={(value) => setNuevoProductoPrecio(value)}
        />
        <br />
        <br />
        <select
          value={nuevaCategoria}
          onChange={(e) => setNuevaCategoria(e.target.value)}
        >
          <option value="">Seleccione una categoría</option>
          <option value="Sushi">Sushi</option>
          <option value="Bebida">Bebida</option>
          <option value="Combo">Combo</option>
          <option value="Postre">Postre</option>
          <option value="Entrada">Entrada</option>
        </select>
      </Modal>
    </>
  );
};

export default Productos;