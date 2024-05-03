import React from 'react';
import { Layout, Menu, theme } from 'antd';
import { Link, Navigate, Route, Routes } from 'react-router-dom'; // Cambio de Redirect a Navigate
import { Content } from 'antd/es/layout/layout';
import Productos from './components/productos';
import Pedidos from './components/pedidos';
import NuevoPedido from './components/nuevoPedido';
import Asientos from './components/asientos';

const { Header } = Layout;

const App = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const items = [
    { key: '1', label: 'Pedidos', to: '/pedidos' },
    { key: '2', label: 'Retiro', to: '/nuevoPedido' },
    { key: '3', label: 'Mesas', to: '/mesas' },
    { key: '4', label: 'Productos', to: '/productos' },

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
          <Route path="/" element={<Navigate to="/pedidos" />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/nuevoPedido" element={<NuevoPedido />} />
          <Route path="/mesas" element={<Asientos />} />
        </Routes>
      </Content>
    </Layout>
  );
};

export default App;