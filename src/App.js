import React from 'react';
import { Layout, Menu, theme } from 'antd';
import { Link, Route, Routes } from 'react-router-dom';
import { Content } from 'antd/es/layout/layout';
import Productos from './components/productos';
import Pedidos from './components/pedidos';
import NuevoPedido from './components/nuevoPedido';

const { Header } = Layout;

const App = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const items = [
    { key: '1', label: 'Pedidos', to: '/pedidos' },
    { key: '2', label: 'Nuevo Pedido', to: '/nuevoPedido' },
    { key: '3', label: 'Productos', to: '/productos' },
  ];

  return (
    <Layout>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['1']}
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          {items.map(item => (
            <Menu.Item key={item.key}>
              <Link to={item.to}>
                {item.label}
              </Link>
            </Menu.Item>
          ))}
        </Menu>
      </Header>
      <Content>
      <Routes>
        <Route path="/productos" element={<Productos />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/nuevoPedido" element={<NuevoPedido />} />
      </Routes>
      </Content>
    </Layout>
  );
};

export default App;
