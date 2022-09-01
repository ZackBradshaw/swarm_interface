import React, { Component } from "react";
import {BsArrowLeftShort, BsSearch} from 'react-icons/bs';
import "../../css/dist/output.css"
import {ReactComponent as ReactLogo} from '../../images/logo.svg'
import { random_colour, random_emoji } from "../../helper/visual";
import { Message, Header, Modal, Button, Icon } from 'semantic-ui-react'

export default class Navbar extends Component{
    constructor(props){
        super(props) 
        this.temp_host = 0
        this.deleteNode = props.onDelete
        this.state = {open : true,
            menu : [],
            colour : props.colour || [],
            text : "",
            name : "",
            emoji : props.emoji || [],
            mode : false,
            modal : false,
            error : false
           }
       
    }


    /**
     *  Asynchronously call the Flask api server every second to check if there exist a gradio application info
     *  @return null
     */
    async fetch_classes(){
        try {
        setInterval( async () => {
            const menu = []
            await fetch("http://localhost:2000/api/open/ports", { method: 'GET', mode : 'cors',})
                .then(response => response.json())
                .then(data => {
                    for (var i = 0; i < data.length; i++){
                        menu.push(data[i])
                    }
                })
                .catch(error => {console.log(error)})
                
                var diff = menu.length - this.state.menu.length
                if(diff !== 0){
                   this.hanelTabs(menu, diff)
                }
        },1000);    
        }catch(e){
            console.log(e)
        }
    }

    /**
     * Append new node from the user 
     */
    append_gradio = async () => {
        const pattern = {
            local : /^https?:\/\/(localhost)*(:[0-9]+)?(\/)?$/,
            share : /^https?:\/\/*([0-9]{5})*(-gradio)*(.app)?(\/)?$/,
            hugginFace : /^https?:\/\/*(hf.space)\/*(embed)\/*([a-zA-Z0-9+_-]+)\/*([a-zA-Z0-9+_-]+)\/*([+])?(\/)?$/
        } 

        if (this.state.menu.findIndex(element => {return element.name.toLowerCase() === this.state.name.toLowerCase() || element.host.includes(this.state.text) }) !== -1 ||
            this.state.text.includes(" ") || 
            (!pattern.local.test(this.state.text) &&
            !pattern.share.test(this.state.text) &&
            !pattern.hugginFace.test(this.state.text))){
            
                this.setState({open : this.state.open,
                    menu : this.state.menu,
                    text: '',
                    name : '',
                    colour : this.state.colour,
                    emoji : this.state.emoji,    
                    error : true,
                    modal : this.state.modal })
                return 
            } 

        fetch(this.state.text, {method : "GET", mode: 'no-cors'}).then((re) => {
            //console.log(re)   
            fetch("http://localhost:2000/api/append/port", {method: 'POST', mode : 'cors', headers : { 'Content-Type' : 'application/json' }, body: JSON.stringify({file : "", kwargs : {}, name : this.state.name === "" ?`temp_class_${this.temp_host++}` : `${this.state.name}`, port: 0 , host : this.state.text}) }).then(resp => {
                this.setState({open : this.state.open,
                               menu : this.state.menu,
                               text: "",
                               name : "",
                               colour : this.state.colour,
                               emoji : this.state.emoji,
                               error : false,
                               modal : false  })

            }).catch(() => this.setState({open : this.state.open,
                                          menu : this.state.menu,
                                          text: '',
                                          name : '',
                                          colour : this.state.colour,
                                          emoji : this.state.emoji,    
                                          error : true,
                                          modal : this.state.modal }))
          }).catch((err)=>{
            //console.log(err)
            this.setState({open : this.state.open,
                menu : this.state.menu,
                text: '',
                name : '',
                colour : this.state.colour,
                emoji : this.state.emoji,    
                error : true,
                modal : this.state.modal })
          })
    }

    /**
     * error check the user input
     * @param {*} bool boolean of the current state of the modal  
     */
    handelModal = (bool) => {
        this.setState({open : this.state.open,
                       menu : this.state.menu,
                       text: this.state.text,
                       name: this.state.name,
                       colour : this.state.colour,
                       emoji : this.state.emoji, 
                       error : !bool ? false : this.state.error ,
                       modal : bool})
    }

    /**
     * when dragged get all the information needed
     * @param {*} event 
     * @param {*} nodeType string 'custom' node type
     * @param {*} item object information returned from the api
     * @param {*} index current index
     */
    onDragStart = (event, nodeType, item, index) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/style', JSON.stringify({colour : this.state.colour[index], emoji : this.state.emoji[index] }))
        event.dataTransfer.setData('application/item',  JSON.stringify(item))
        event.dataTransfer.effectAllowed = 'move';
      };

    /**
     * droped event that occurs when the user drops the Tab within the tash div.
     * The function just deletes all nodes within React-Flow enviorment related, 
     * and remove it from the api.
     * @param {*} e drop event  
     */
    onDragDrop = (e) => {
        e.preventDefault();
        var item  = JSON.parse(e.dataTransfer.getData('application/item'));
        fetch("http://localhost:2000/api/remove/port", {method : "POST", mode: 'cors', headers : { 'Content-Type' : 'application/json' }, body: JSON.stringify(item) }).then((re)=>{
            this.deleteNode(item.name)
        })
       
    }

    /**
     * update the tabs within the navbar
     * @param {*} e current menu 
     * @param {*} d integer variable of the diffence between the current menu and new menu updated ment
     */
    hanelTabs = (e, d) => {
        // if less then 0 we must remove colour's and emoji's
        // get index of the object
        // remove
        var c = []
        var j = []
        if(d < 0){
            var a = this.state.menu.filter(item => !e.includes(item)) // get the items not in menu anymore
            c = this.state.colour
            j = this.state.emoji
            for(var k=0; k < d; k++){
                c.splice(this.state.menu.indexOf(a[k]), 1)
                j.splice(this.state.menu.indexOf(a[k]), 1)
            }
            this.setState({open : this.state.open, menu : e, text: this.state.text, name: this.state.name, colour : c, emoji : j,   error : this.state.error, modal : this.state.modal })
        }else{
            //append new colours
            for(var i =0; i < d; i++){
                    c.push(random_colour(i === 0 ? null : c[i-1]));
                    j.push(random_emoji(i === 0 ? null : c[i-1]));
                
            }
            this.setState({open : this.state.open, menu : e, text: this.state.text, name: this.state.name, colour : [...this.state.colour, ...c], emoji : [...this.state.emoji, ...j], error : this.state.error, modal : this.state.modal })
        }
    }

    /**
     * handel navagation open and close function
     */
    handelNavbar = () => {
        this.setState({open : !this.state.open, menu : this.state.menu, text: this.state.text, name: this.state.name, colour : this.state.colour, emoji : this.state.emoji,  error : this.state.error, modal : this.state.modal  })
    }

    /**
     * 
     * @param {*} e : event type to get the target value of the current input
     * @param {*} type : text | name string that set the changed value of the input to the current value 
     */
    updateText(e, type){
        this.setState({open : this.state.open, menu : this.state.menu, text: type === "text" ? e.target.value : this.state.text, name: type === "name" ? e.target.value : this.state.name, colour : this.state.colour, emoji : this.state.emoji,  error : this.state.error, modal : this.state.modal  })
    }

    /**
     * 
     * @param {*} item : object infomation from the flask api  
     * @param {*} index : current index with in the list
     * @returns div component that contians infomation of gradio 
     */
    subComponents(item, index){
        
        return(<>
                <li key={`${index}-li`} onDragStart={(event) => this.onDragStart(event, 'custom', item, index)} 
                    className={` text-white text-md flex flex-col text-center items-center cursor-grab shadow-lg
                                 p-5 px-2 mt-4 rounded-md ${ this.state.open ? `hover:animate-pulse ${this.state.colour[index] === null ? "" : this.state.colour[index]} ` : `hidden`}  break-all -z-20`} draggable>

                    <div key={`${index}-div`}  className=" absolute -mt-2 text-4xl opacity-60 z-10 ">{`${this.state.emoji[index] === null ? "" : this.state.emoji[index]}`}</div>    
                    <h4 key={`${index}-h4`}  className={`  max-w-full font-sans text-blue-50 leading-tight font-bold text-xl flex-1 z-20  ${this.state.open ? "" : "hidden"}`} style={{"textShadow" : "0px 1px 2px rgba(0, 0, 0, 0.25)"}} >{`${item.name}`} </h4>

                </li >      

        </>)
    }


    render(){
        this.fetch_classes()
        return (<div>
        
            <div className={`z-10 flex-1 float-left bg-white dark:bg-stone-900 h-screen p-5 pt-8 ${this.state.open ? "lg:w-72 md:64 sm:w-60" : "w-10"} duration-300 absolute shadow-2xl border-black border-r-[1px] dark:border-white dark:text-white`}>

            <BsArrowLeftShort onClick={this.handelNavbar} className={`  bg-white text-Retro-darl-blue text-3xl rounded-full absolute -right-3 top-9 border border-black cursor-pointer ${!this.state.open && 'rotate-180'} dark:border-white duration-300 dark:text-white dark:bg-stone-900 `}/>

                <div className="inline-flex w-full">
                    <h1 className={`font-sans font-bold text-lg ${this.state.open ? "" : "hidden"} duration-500 ml-auto mr-auto`}> <ReactLogo className="w-9 h-9 ml-auto mr-auto"/> Gradio Flow </h1>
                </div>

                <div className={`rounded-md text-center ${this.state.open ? "" : "px-0"} py-3`} onClick={() => {this.handelModal(true)}}>
                    <div className={` text-center bg-transparent w-full h-10 border border-slate-300 hover:border-Retro-purple hover:animate-pulse border-dashed rounded-md py-2 pl-5 ${this.state.open ? "pr-3" : "hidden"} shadow-sm sm:text-sm`}>
                        <Icon className=" block mr-auto ml-auto" name="plus"/>
                    </div>
                </div>

                <Modal
                    basic
                    open={this.state.modal}
                    size='small'
                >
                <Header className="select-none space-y-4" icon>
                    🌐 
                    <br/>
                    Append Shared Gradio Hosts 
                </Header>
                <Modal.Content>
                <div className=" text-center select-none">Host other HugginFace Models or Gradio application via shared link</div>
                <div className={`flex items-center rounded-md bg-light-white mt-6  border-dashed`}>
                <label className="relative block w-full">
                    <span className={`absolute inset-y-0 left-0 flex items-center pl-3`}>
                        <BsSearch className="block float-left cursor-pointer mr-2"/>
                    </span>
                    <input className={`placeholder:italic placeholder:text-slate-400 block bg-transparent w-full border border-slate-300 border-dashed rounded-md py-2 pl-9 ${this.state.open ? "pr-3" : "hidden"} shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm bg-transparent`} 
                           placeholder={`stream link...`}
                           type="text" name="search"
                           onChange={(e) => {
                            this.updateText(e, "text")
                           }}
                        
                           />
                </label>
                </div>
                <div className={`flex items-center rounded-md bg-light-white mt-6  border-dashed`}>
                <label className="relative block w-full">
                    <span className={`absolute inset-y-0 left-0 flex items-center pl-3`}>
                        <Icon className="block float-left cursor-pointer mr-2" name="address card"/>
                    </span>
                    <input className={`placeholder:italic placeholder:text-slate-400 block bg-transparent w-full border border-slate-300 border-dashed rounded-md py-2 pl-9 ${this.state.open ? "pr-3" : "hidden"} shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1  sm:text-sm`} 
                           placeholder={`Give it name...` }
                           type="text" name="search"
                           onChange={(e) => {
                            this.updateText(e, "name")
                           }}
                           autoComplete='off'
                           />
                </label>
                </div>

                { this.state.error &&
                <Message negative>
                <Message.Header className=" text-lg text-center">🚫 Something went wrong...</Message.Header>
                    <br/>
                    <h1 className=" underline pb-3 font-bold text-lg">🤔 Possible Things That could of happen <br/></h1>
                    <ul className="font-bold">
                            <li key={"error_1"}>- The input was empty</li>
                            <li key={"error_2"}>- The connection was forbidden</li>
                            <li key={"error_3"}>- The name was already taken</li>
                            <li key={"error_4"}>- The link you gave did not pass the regex</li>
                            <ul className="px-6">
                                <li key={"error_5"}>- http://localhost:xxxx</li>
                                <li key={"error_6"}>- http://xxxxx.gradio.app</li>
                                <li key={"error_7"}>- https://hf.space/embed/$user/$space_name/+</li>
                            </ul>
                            <li>- link already exist within the menu</li>
                        </ul>

                </Message>
                }

                </Modal.Content>
                    <Modal.Actions>
                        <Button basic color='red' inverted onClick={() => {this.handelModal(false)}}>
                        <Icon name='remove' /> Exit
                        </Button>
                        <Button color='green' inverted onClick={() => {this.append_gradio()}}>
                        <Icon name='checkmark' /> Append
                        </Button>
                    </Modal.Actions>                    
                </Modal>

                <div className=" relative z-10 h-auto overflow-auto pt-4">
                    <ul className="pt-2">
                    {this.state.menu.map((menu, index) => {return this.subComponents(menu, index)})}
                    </ul>
                </div>

                <div className={`${this.state.open ? "" : "hidden"} absolute bottom-0 left-0 w-full text-center p-5`} onDragOver={(e)=> {e.preventDefault()}} onDrop={(e)=>{this.onDragDrop(e)}}>
                    <div className={` text-center bg-transparent w-full h-10 border border-red-600 border-dashed rounded-md py-2 pl-5 p-4 ${this.state.open ? "pr-3" : "hidden"} shadow-sm sm:text-sm`}>
                        <Icon name='trash alternate' />                   
                    </div>
                </div>
            </div>
            
        </div>)
    }
}

/**
 *                 
 * **/
