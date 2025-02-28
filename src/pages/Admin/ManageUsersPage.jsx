import { useState, useEffect } from 'react';
import { Button, Col, Radio, Drawer, Row, Modal, Form, Input, Table, Select, notification, Upload, Space } from 'antd';
import { EyeOutlined, UserSwitchOutlined } from '@ant-design/icons';
import styles from '../../assets/ManageUsersPage.module.scss';
import { fetchUsersAction, updateUserByIdAction, fetchUserByIdAction, activateUserAction } from '../../store/redux/action/userAction';
import { useDispatch, useSelector } from 'react-redux';

const { confirm } = Modal;
const { Option } = Select;

const ManageUsersPage = () => {
  const [open, setOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const [filterRole, setFilterRole] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState('https://via.placeholder.com/150?text=Avatar'); // Avatar mặc định
  const [avatarFile, setAvatarFile] = useState(null);

  const dispatch = useDispatch();
  const usersData = useSelector((state) => state.userReducer.listUser);
  const userDetailData = useSelector((state) => state.userReducer.user);

  useEffect(() => {
    dispatch(fetchUsersAction());
  }, [dispatch]);

  const handleSearch = (value) => {
    setSearchValue(value.toLowerCase());
  };

  const filteredUsersData = Array.isArray(usersData)
    ? usersData.filter((user) => {
        const userRole = user.role?.name?.toLowerCase() || '';
        const matchesRole = filterRole === 'all' || userRole === filterRole;
        const matchesSearch =
          !searchValue ||
          (user.fullName && user.fullName.toLowerCase().includes(searchValue)) ||
          (user.email && user.email.toLowerCase().includes(searchValue)) ||
          (user.address && user.address.toLowerCase().includes(searchValue));
        return matchesRole && matchesSearch;
      })
    : [];

  const showDrawer = (title, user = null) => {
    setDrawerTitle(title);
    setSelectedUser(user);
    setOpen(true);
    if (user?.id) {
      dispatch(fetchUserByIdAction(user.id));
    }
  };

  useEffect(() => {
    if (userDetailData) {
      form.setFieldsValue({
        fullName: userDetailData.fullName || '',
        email: userDetailData.email || '',
        roleId: userDetailData.role?.name || '',
        dateOfBirth: userDetailData.dateOfBirth || '',
        avatar: userDetailData.avatar || '',
        experience: userDetailData.experience || 0,
        isActive: userDetailData.isActive ? 'true' : 'false',
        subscription: userDetailData.subscription || '',
      });

      if (userDetailData.avatar) {
        setPreviewAvatar(userDetailData.avatar);
      } else {
        setPreviewAvatar('https://via.placeholder.com/150?text=Avatar'); // Đặt lại avatar mặc định nếu không có avatar
      }
    }
  }, [userDetailData, form]);

  const closeDrawer = () => {
    setOpen(false);
    setSelectedUser(null);
    setPreviewAvatar('https://via.placeholder.com/150?text=Avatar'); // Đặt lại avatar mặc định khi đóng drawer
    setAvatarFile(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      await form.validateFields();
      const userId = selectedUser?.id || userDetailData?.id;
      if (!userId) {
        throw new Error('User ID is undefined');
      }

      const formData = new FormData();
      formData.append('fullName', values.fullName);
      formData.append('dateOfBirth', values.dateOfBirth);

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      await dispatch(updateUserByIdAction(userId, formData));

      notification.success({
        message: 'Success',
        description: 'User information updated successfully',
      });

      closeDrawer();
      dispatch(fetchUsersAction());
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to update user information',
      });
    }
  };

  const handleAvatarChange = (info) => {
    const file = info.file;
    setAvatarFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewAvatar(e.target.result);
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleToggleStatus = (id) => {
    const user = usersData.find((user) => user.id === id);
    if (user) {
      confirm({
        title: `Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} this user?`,
        onOk() {
          dispatch(activateUserAction(user.id))
            .then(() => {
              notification.success({
                message: 'Success',
                description: `User ${user.isActive ? 'deactivated' : 'activated'} successfully`,
              });
              dispatch(fetchUsersAction());
            })
            .catch(() => {
              notification.error({
                message: 'Error',
                description: `Failed to ${user.isActive ? 'deactivate' : 'activate'} user`,
              });
            });
        },
      });
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role', render: (role) => role.name || 'Unknown' },
    { title: 'Birthday', dataIndex: 'dateOfBirth', key: 'dateOfBirth' },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive) => (isActive ? 'Active' : 'Inactive'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <span>
          <Button type="link" icon={<EyeOutlined />} onClick={() => showDrawer('View User', record)}>View</Button>
          <Button
            disabled={record.isActive}
            type="link"
            icon={<UserSwitchOutlined />}
            onClick={() => handleToggleStatus(record.id)}
          >
            {record.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div className={styles.manageUsersPage}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Input
            placeholder="Search"
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />
        </Col>
      </Row>
      <Radio.Group
        onChange={(e) => setFilterRole(e.target.value)}
        value={filterRole}
        style={{ marginBottom: 16 }}
      >
        <Radio.Button value="all">All</Radio.Button>
      </Radio.Group>
      <Table dataSource={filteredUsersData} columns={columns} rowKey="id" />
      <Drawer
        title={drawerTitle}
        width={640}
        onClose={closeDrawer}
        visible={open}
      >
        <Form onFinish={handleSubmit} layout="vertical" form={form}>
          <Form.Item name="fullName" label="Full Name">
            <Input disabled />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input disabled />
          </Form.Item>
          <Form.Item name="roleId" label="Role">
            <Input disabled />
          </Form.Item>
          <Form.Item name="dateOfBirth" label="Date of Birth">
            <Input type="date" disabled />
          </Form.Item>
          <Form.Item name="avatar" label="Avatar">
            <div style={{ position: 'relative', width: '150px', height: '150px', marginBottom: '16px' }}>
              <img
                src={previewAvatar}
                alt="Avatar"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #1890ff',
                }}
              />
              <Upload
                name="avatar"
                showUploadList={false}
                beforeUpload={handleAvatarChange}
                style={{ position: 'absolute', bottom: 0, right: 0 }}
              >
                {/* <Button
                  icon={<CameraOutlined />}
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    borderRadius: '50%',
                    backgroundColor: '#1890ff',
                    color: 'white',
                    border: 'none',
                  }}
                /> */}
              </Upload>
            </div>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default ManageUsersPage;