import React, {Component} from 'react';
import Ditto from './Ditto.png';
import token from './ditto-token.png';
import './App.css';
import Navbar from './Components/Navbar';
//import Web3 from 'web3';
import {ditto_swap_address, ditto_swap_abi} from './DittoPair';
import { CSVLink} from "react-csv";
import numeral from 'numeral';



let Web3 = require('web3');


class App extends Component {
    constructor(props) {
      super(props);
      this.state = {

        ditto_token:[],
        firstBlock:11924280,

        toBlock:0,
        fromBlock:0,
        lastKnownBlock:0,
        blocksPerDay:5760,

        proxyFrom:0,
        proxyTo:0,
        
        swaps:[],
        address_swaps:[],
        filter:[],
        added:[],
        sortedVolume:[],
        loading:true,

        blockError:[],
         
      }
    }


  async loadToken(){ 
 
      this.setState({
        swaps:[],
        address_swaps:[],
        filter:[],
        sortedVolume:[],
        loading:true
      })
       
        const web3 = new Web3('wss://mainnet.infura.io/ws/v3/72e114745bbf4822b987489c119f858b');
        const ditto_token = new web3.eth.Contract(ditto_swap_abi, ditto_swap_address);
        this.setState({ditto_token:ditto_token});
        const currentBlock = await web3.eth.getBlockNumber()
        this.setState({fromBlock:currentBlock - this.state.blocksPerDay, toBlock:currentBlock,lastKnownBlock:currentBlock })
        
       ditto_token.getPastEvents("SwapDeposit",{fromBlock:this.state.fromBlock, toBlock:this.state.toBlock})
        .then(events=>{
         
          var newest = events.concat().sort((a,b)=> b.blockNumber- a.blockNumber);
          this.setState({swaps:newest.map(value=>(value.returnValues))},()=>console.log());
            for(var i = 0; i < this.state.swaps.length;i++){
                   
                this.setState({address_swaps:[...this.state.address_swaps,{address:this.state.swaps[i].depositor,
                  ditto_received:this.state.swaps[i].outputAmount / 1000000000,
                  airdrop_reward:(10/100)*(this.state.swaps[i].outputAmount / 1000000000),
                  fromBlock:numeral(this.state.fromBlock).format('0,00'),
                  toBlock:numeral(this.state.toBlock).format('0,00')}]})
                
         let index = this.state.filter.findIndex(x=>x.address === this.state.address_swaps[i].address)
          if(index === -1){
            this.setState({filter:[...this.state.filter,this.state.address_swaps[i]]})
          }
      
         else{
      
          let filter=  [...this.state.filter]
          let received = this.state.filter[index].ditto_received + this.state.address_swaps[i].ditto_received
          let reward = this.state.filter[index].airdrop_reward + this.state.address_swaps[i].airdrop_reward
          
           filter[index] = {address:this.state.filter[index].address, 
                            ditto_received:received,
                            airdrop_reward:reward, 
                            fromBlock:numeral(this.state.fromBlock).format('0,00'),
                            toBlock:numeral(this.state.toBlock).format('0,00')}
      
           this.setState({filter,lastKnownBlock:currentBlock })     
         }      
        }
        
        this.setState({sortedVolume:this.state.filter.concat().sort((a,b)=> b.airdrop_reward - a.airdrop_reward),loading:false})
        console.log(this.state.sortedVolume)
      }).catch((err)=> this.setState({blockError:'Too Deep! Try searching smaller block difference, ie: from-block:4,000,000 to-block:4,200,000',loading:false,sortedVolume:[]}))
  
        }




async loadSearch(){ 
 
  this.setState({
    swaps:[],
    address_swaps:[],
    filter:[],
    sortedVolume:[],
    loading:true
  })
   
    const web3 = new Web3('wss://mainnet.infura.io/ws/v3/72e114745bbf4822b987489c119f858b');
    const ditto_token = new web3.eth.Contract(ditto_swap_abi, ditto_swap_address);
    this.setState({ditto_token:ditto_token});
    const currentBlock = await web3.eth.getBlockNumber();
    this.setState({lastKnownBlock:currentBlock })
   
    ditto_token.getPastEvents("SwapDeposit",{fromBlock:this.state.fromBlock, toBlock:this.state.toBlock})
    .then(events=>{
      console.log(events)
      var newest = events.concat().sort((a,b)=> b.blockNumber- a.blockNumber);
          this.setState({swaps:newest.map(value=>(value.returnValues))},()=>console.log());
            for(var i = 0; i < this.state.swaps.length;i++){
                   
                this.setState({address_swaps:[...this.state.address_swaps,{address:this.state.swaps[i].depositor,
                  ditto_received:this.state.swaps[i].outputAmount / 1000000000,
                  airdrop_reward:(10/100)*(this.state.swaps[i].outputAmount / 1000000000),
                  fromBlock:numeral(this.state.fromBlock).format('0,00'),
                  toBlock:numeral(this.state.toBlock).format('0,00')}]})
            
      let index = this.state.filter.findIndex(x=>x.address === this.state.address_swaps[i].address)
      if(index === -1){
        this.setState({filter:[...this.state.filter,this.state.address_swaps[i]]})
        }
  
      else{
  
        let filter=  [...this.state.filter]
        let received = this.state.filter[index].ditto_received + this.state.address_swaps[i].ditto_received
        let reward = this.state.filter[index].airdrop_reward + this.state.address_swaps[i].airdrop_reward
        
         filter[index] = {address:this.state.filter[index].address, 
                          ditto_received:received,
                          airdrop_reward:reward, 
                          fromBlock:numeral(this.state.fromBlock).format('0,00'),
                          toBlock:numeral(this.state.toBlock).format('0,00')}
  
       this.setState({filter,lastKnownBlock:currentBlock })     
     }      
    }
  

    this.setState({sortedVolume:this.state.filter.concat().sort((a,b)=> b.airdrop_reward - a.airdrop_reward),loading:false})
    }).catch((err)=> this.setState({blockError:'Too Deep! Try searching smaller block difference, ie: from-block:4,000,000 to-block:4,200,000',loading:false,sortedVolume:[]}))
    }



  fromBlockChange = (event)=>{
    let fromBlock = event.target.value;
    this.setState({proxyFrom:fromBlock},()=>console.log())
 };

 
  toBlockChange = (event)=>{
    let toBlock = event.target.value;
    this.setState({proxyTo:toBlock},()=>console.log())
  };

 

search = (event)=>{
  
  if(this.state.proxyFrom < this.state.firstBlock || this.state.proxyTo < this.state.firstBlock){
    this.setState({blockError:'Woah! Ditto Swap starts at Block ' + this.state.firstBlock})
  }

  else if(this.state.proxyFrom > this.state.proxyTo){
    this.setState({blockError:'Woah! "From-Block" is Greater than "To-Block"!'})
  }
  else{
  this.setState({ blockError:'',
                  fromBlock:this.state.proxyFrom,
                  toBlock:this.state.proxyTo,
                  blockError:''},()=>this.loadSearch())
  }
}

daily = (event)=>{
this.loadToken()        
            
}





    render(){

      const headers = [
        { label: "Address", key: "address" },
        { label: "Total Ditto Received", key: "ditto_received" },
        { label: "Total Airdrop Reward", key: "airdrop_reward" },
        { label: "From Block", key: "fromBlock" },
        { label: "To Block", key: "toBlock" },

      ];

  return (
    <div className="App">
      <Navbar/>
      
       <header className="App-header">
      


       <div className="row mb-3">


        <div className="form-group">
        <span className="input-title">From Block</span> 
        <input onChange={this.fromBlockChange} type="number" min="0" onKeyPress={event => {
                if (event.key === 'Enter') {
                  this.search()
                }
              }}></input>
        </div>

        <div className="form-group">
        <span className="input-title">To Block</span> 
        <input onChange={this.toBlockChange} type="number" min="0" onKeyPress={event => {
                if (event.key === 'Enter') {
                  this.search()
                }
              }}></input>
        </div>

        </div>

        
       
        <button className="search-button" onClick={this.search} >Search</button>
        <button className="search-button" onClick={this.daily} >View past 24 hours</button>
        
        <p>{this.state.blockError}</p>

        <div className="body">
        <div className="row">
        <div className="column">
         <p className='disclaimer'>Rewards for eligible users of Ditto Swap from block {numeral(this.state.fromBlock).format('0,00')} to block {numeral(this.state.toBlock).format('0,00')}</p>
         <p className='disclaimer2'>Last Known Block: {numeral(this.state.lastKnownBlock).format('0,00')}</p>
         </div>
         </div>
         <div className="table-wrapper">
         <div> <h3>Eligible Addresses for Rewards</h3></div>

                <table className="table-size">
               
                 
  
                 <thead>
                 <tr>
                 <th>No.</th>
                 <th>Address</th>
                 <th>Total Ditto Reward</th>
                 
                </tr>
              </thead>
              
              <tbody>
              </tbody>
                {!this.state.loading && this.state.sortedVolume.map((swaps,index)=> <tr
                 className="cursor-pointer mt-2" key={index}>  
				        <td >{index + 1}</td>   
                <td> <a href={'https://etherscan.io/address/' + swaps.address} target='blank'>{swaps.address}</a></td>     
      	        <td><div><img src={token} className="ditto-logo" border={1} alt="Ditto logo" width={20}/></div>{numeral(swaps.airdrop_reward).format('0,00.0000')}</td>
                </tr>  )}             
              </table> 
              {this.state.loading &&<img className="loadingLogo" src={Ditto} border={1} alt="Ditto logo" width={20}></img>}
             </div>
             
             {!this.state.loading &&<CSVLink className='disclaimer2' data={this.state.sortedVolume} headers={headers}>Download as CSV</CSVLink>}
         

         </div>
     </header>
     
         <p className='footer'>Happy Swapping!</p>

    </div>
    
  );
}

componentDidMount() {
  this._isMounted = true; 
  this.loadToken();
}


}


export default App;