import React, { useState } from 'react';
import { Table, Button, Space, Modal, Input } from 'antd';

const Productos = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoProductoDescripcion, setNuevoProductoDescripcion] = useState('');

  const handleNuevoProducto = () => {
    setModalVisible(true);
  };

  const handleAceptar = () => {
    // Aquí puedes manejar la lógica para guardar el nuevo producto
    console.log('Descripción del nuevo producto:', nuevoProductoDescripcion);
    setModalVisible(false);
    setNuevoProductoDescripcion('');
  };

  const data = [
    {
      key: '1',
      descripcion: 'Producto 1',
    },
    {
      key: '2',
      descripcion: 'Producto 2',
    },
    {
      key: '3',
      descripcion: 'Producto 3',
    },
  ];

  const columns = [
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
    },
    {
      title: 'Acción',
      key: 'action',
      align: 'right',
      render: (text, record) => (
        <Space size="small">
          <Button type="primary" danger>
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
      <Table dataSource={data} columns={columns} />
      <Modal
        title="Nuevo Producto"
        visible={modalVisible}
        onOk={handleAceptar}
        onCancel={() => setModalVisible(false)}
      >
        <Input
          placeholder="Ingrese la descripción del nuevo producto"
          value={nuevoProductoDescripcion}
          onChange={(e) => setNuevoProductoDescripcion(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default Productos;