import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Space } from 'antd';
import ReactFlow, {
    ControlButton,
} from 'reactflow';
import { nodeTypes, nodeTitles } from '../ressources/nodeTypes';

function createNodeTypeList() {
    return Object.entries(nodeTitles).map(([key, value], index) => {
        return {
            label: <a>{value}</a>,
            key: index.toString()
        }
    })
}

const items = createNodeTypeList(nodeTypes);

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