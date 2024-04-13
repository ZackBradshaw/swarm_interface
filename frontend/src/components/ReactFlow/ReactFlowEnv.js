import Custom from "../Nodes/Custom.js";
import StarNest from './StarNest.js';
import CustomNodeIframe from "../Nodes/Custom.js";
import '../../css/dist/output.css';
import ReactFlow, {
  Background,
  applyNodeChanges,
  ReactFlowProvider,
  addEdge,
  updateEdge,
  applyEdgeChanges,
  Controls,
  MarkerType
} from 'react-flow-renderer';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Navbar from '../Navagation/navbar.js';
import CustomEdge from '../Edges/Custom.js';
import CustomLine from "../Edges/CustomLine.js";
import { useThemeDetector } from '../../helper/visual.js';
import { CgMoreVerticalAlt } from 'react-icons/cg';
import { BsFillEraserFill } from 'react-icons/bs';
import { FaRegSave } from 'react-icons/fa';

const NODE = {
    custom : CustomNodeIframe,
    embed: Custom, 
  }

const EDGE = {
    custom : CustomEdge
}


export default function ReactEnviorment() {

    const [theme, setTheme] = useState(useThemeDetector)
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([])
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const reactFlowWrapper = useRef(null);
    const [tool, setTool] = useState(false)
    const [showProxmoxForm, setShowProxmoxForm] = useState(false);

    const deleteNodeContains = useCallback((id) => setNodes((nds) => nds.filter(n => !n.id.includes(`${id}-`))), [setNodes]);
    const deleteEdge = useCallback((id) => setEdges((eds) => eds.filter(e => e.id !== id)), [setEdges]);
    const deleteNode = useCallback((id) => setNodes((nds) => nds.filter(n => n.id !== id)), [setNodes]);

    useEffect(() => {
      const restore = () => {
        const flow = JSON.parse(localStorage.getItem('flowkey'));
        
        if(flow){
          const updatedNodes = flow.nodes.map((nds) => ({ ...nds, data: { ...nds.data, delete: deleteNode }}));
          const updatedEdges = flow.edges.map((eds) => ({ ...eds, data: { ...eds.data, delete: deleteEdge }}));
          setNodes(updatedNodes || []);
          setEdges(updatedEdges || []);
        }
      }
      restore();
    },[deleteNode, deleteEdge]);

  const handleAddProxmoxVnc = useCallback((iframeSrc) => {
    const newNode = {
      id: `proxmox-vnc-${nodes.length + 1}`,
      type: 'custom',
      position: reactFlowInstance.project({ x: 0, y: 0 }),
      data: { label: `Proxmox VM`, url: iframeSrc },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, reactFlowInstance, setNodes]);


  const handleAddEmbed = useCallback((embedData) => {
    const newNode = {
      id: `embed-${nodes.length + 1}`,
      type: 'embed',
      position: reactFlowInstance.project({ x: 0, y: 0 }), // Adjust position as needed
      data: { url: embedData.url, width: embedData.width || '100%', height: embedData.height || '400px' },
    };
    setNodes((nds) => nds.concat(newNode));
    console.log(`Adding embed with URL: ${embedData.url} and Label: ${embedData.label}`);
  }, [nodes, reactFlowInstance]);

    const onNodesChange = useCallback(
      (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
      [setNodes]
    );
  
    const onEdgesChange = useCallback(
      (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
      [setEdges]
    );

    const onEdgeUpdate = useCallback(
      (oldEdge, newConnection) => setEdges((els) => updateEdge(oldEdge, newConnection, els)),
      [setEdges]
    );

    const onConnect = useCallback(
      (params) => {
        setEdges((els) => addEdge({...params, type: "custom", animated : true, style : {stroke : "#00FF4A", strokeWidth : "6"}, markerEnd: {type: MarkerType.ArrowClosed, color : "#00FF4A"}, data : { delete : deleteEdge}}, els))
        fetch("http://localhost:2000/api/append/connection", {method : "POST", mode : 'cors', headers : { 'Content-Type' : 'application/json' }, body: JSON.stringify({"source": params.source, "target" : params.target})}).then( res => {
          console.log(res)
        }).catch(error => {
          console.log(error)
        })
      },
      [setEdges, deleteEdge]
    );

    const onDragOver = useCallback((event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }, []);

    const onSave = useCallback(() => {
      if (reactFlowInstance) {
        const flow = reactFlowInstance.toObject();
        alert("The current nodes have been saved into the localstorage 💾")
        localStorage.setItem('flowkey', JSON.stringify(flow));
        var labels = [];
        var colour = [];
        var emoji = [];
        flow.nodes.forEach((node) => {
          if (!labels.includes(node.data.label)) {
            colour.push(node.data.colour);
            emoji.push(node.data.emoji);
            labels.push(node.data.label);
          }
        });
        localStorage.setItem('colour', JSON.stringify(colour));
        localStorage.setItem('emoji', JSON.stringify(emoji));
      }
    }, [reactFlowInstance]);

    const onErase = useCallback(() => {
      const flow = localStorage.getItem("flowkey")
      if (reactFlowInstance && flow){
        alert("The current nodes have been erased from the localstorage")
        localStorage.removeItem("flowkey")
        localStorage.removeItem('colour')
        localStorage.removeItem('emoji')
      }
    },[reactFlowInstance]);
    const onDrop = useCallback(
      (event) => {
        event.preventDefault();

        const reactFlowType = event.dataTransfer.getData('application/reactflow');
        if (reactFlowType !== "") {
          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          const item = JSON.parse(event.dataTransfer.getData('application/item'));
          const style = JSON.parse(event.dataTransfer.getData('application/style'));
          const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          });

          let newNode = null;
          switch (reactFlowType) {
            case 'customProxmox':
              newNode = {
                id: `proxmox-vm-${nodes.length + 1}`,
                type: 'customProxmox',
                position,
                data: { vmAddress: item.vmAddress },
              };
              break;
            case 'embed':
              newNode = {
                id: `embed-${nodes.length + 1}`,
                type: 'embed',
                position,
                data: { url: item.url, width: item.width, height: item.height },
              };
              break;
            default:
              newNode = {
                id: `${item.name}-${nodes.length + 1}`,
                type: reactFlowType,
                position,
                dragHandle: `#draggable`,
                data: { label: item.name, host: item.host, colour: style.colour, emoji: style.emoji, delete: deleteNode },
              };
              break;
          }

          if (newNode) {
            setNodes((nds) => nds.concat(newNode));
          }
        }
      },
      [reactFlowInstance, nodes, setNodes, deleteNode]
    );

  // const addProxmoxVMNode = (vmAddress) => {
  //     const newNode = {
  //         id: `proxmox-vm-${nodes.length + 1}`,
  //         type: 'proxmoxVM',
  //         position: { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight },
  //         data: { vmAddress },
  //     };
  //     setNodes((nds) => nds.concat(newNode));
  //     setShowProxmoxForm(false);
  // };

  return (
    <div className={`${theme ? "dark" : ""}`}>
      <div className={` absolute text-center ${tool ? "h-[203.3333px]" : "h-[41px]"} overflow-hidden w-[41px] text-4xl top-4 right-5 z-50 cursor-default select-none bg-white dark:bg-stone-900 rounded-full border border-black dark:border-white duration-500`}  >
        <CgMoreVerticalAlt className={` text-black dark:text-white ${tool ? "-rotate-0 mr-auto ml-auto mt-1" : " rotate-180 mr-auto ml-auto mt-1"} duration-300`} onClick={() => setTool(!tool)} />
        <h1 title={theme ? 'Dark Mode' : 'Light Mode'} className={`p-4 px-1 pb-0 ${tool ? "visible" : "invisible"} text-3xl`} onClick={() => setTheme(!theme)} >{theme ? '🌙' : '☀️'}</h1>
        <FaRegSave title="Save" className={`mt-6 text-black dark:text-white ${tool ? "visible" : " invisible"} ml-auto mr-auto `} onClick={() => onSave()} />
        <BsFillEraserFill title="Erase" className={`mt-6 text-black dark:text-white ml-auto mr-auto ${tool ? "visible" : " invisible"} `} onClick={() => onErase()} />
      </div>
      <div className={`flex h-screen w-screen ${theme ? "dark" : ""} transition-all`}>
        <ReactFlowProvider>
          <Navbar onDelete={deleteNodeContains} colour={JSON.parse(localStorage.getItem('colour'))} emoji={JSON.parse(localStorage.getItem('emoji'))} nodes={nodes} />
          <div className="h-screen w-screen" ref={reactFlowWrapper}>
            <ReactFlow nodes={nodes} edges={edges} nodeTypes={NODE} edgeTypes={EDGE} onNodesChange={onNodesChange} onNodesDelete={deleteNode} onEdgesChange={onEdgesChange} onEdgeUpdate={onEdgeUpdate} onConnect={onConnect} onDragOver={onDragOver} onDrop={onDrop} onInit={setReactFlowInstance} connectionLineComponent={CustomLine} fitView>
              <StarNest />
              <Controls />
            </ReactFlow>
          </div>
          </ReactFlowProvider>
        </div>
      </div>
    );
  }



