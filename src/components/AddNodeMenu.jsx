import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Space } from 'antd';
import ReactFlow, {
    ControlButton,
} from 'reactflow';

const items = [
    {
        label: <a href="https://www.antgroup.com">1st menu item</a>,
        key: '0',
    },
    {
        label: <a href="https://www.aliyun.com">2nd menu item</a>,
        key: '1',
    },
    {
        type: 'divider',
    },
    {
        label: '3rd menu item',
        key: '3',
    },
];
const AddMenuDropdown = () => (
    <Dropdown
        menu={{
            items,
        }}
        trigger={['click']}
        align={{ offset: [40, -20] }}
    >
        <a onClick={(e) => e.preventDefault()}>
            <ControlButton>
                <div><font size="+2">+</font></div>
                <DownOutlined />
            </ControlButton>
        </a>
    </Dropdown >
);
export default AddMenuDropdown;