import logo from './logo.svg';
import './App.css';
import cube from './assests/deployed_code_FILL0_wght400_GRAD0_opsz48.svg'
import { ReactComponent as Cubes } from './assests/deployed_code_FILL0_wght400_GRAD0_opsz48.svg';
import {ReactComponent as Jslogo} from './assests/javascript_FILL0_wght400_GRAD0_opsz48.svg';
import {ReactComponent as Terminallogo} from './assests/terminal_FILL0_wght400_GRAD0_opsz48.svg';
import {ReactComponent as Hooklogo} from './assests/webhook_FILL0_wght400_GRAD0_opsz48.svg';
import {ReactComponent as Bracketlogo} from './assests/code_FILL0_wght400_GRAD0_opsz48.svg';
import {ReactComponent as Htmlogo} from './assests/html_FILL0_wght400_GRAD0_opsz48.svg';
import {ReactComponent as Mobdevlogo} from './assests/developer_mode_FILL0_wght400_GRAD0_opsz48.svg';

function App() {
  return (
    <div className="App">
      <div className='iconholder'>
        <Mobdevlogo fill='#E64D33' style={{ height: 150, width: 150 }} id="mobdevicon"/>
        <Htmlogo fill='#E64D33' style={{ height: 150, width: 150 }} id="htmlicon"/>
        <Bracketlogo fill='#E64D33' style={{ height: 150, width: 150 }} id="bracketicon"/>
        <Hooklogo fill='#E64D33' style={{ height: 200, width: 200 }} id="webhookicon"/>
        <Terminallogo fill='#E64D33' style={{ height: 243, width: 243 }} id="termicon"/>
        <Jslogo fill='#E64D33' style={{ height: 243, width: 343 }} id="jsicon"/>
        <Cubes fill='#E64D33' style={{ height:243, width: 243 }} id="cubeicons"/>
      </div>
      {/* <img src={cube} alt="cube Logo" className='icons'  /> */}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#e64d33" fillOpacity="1" d="M0,64L40,101.3C80,139,160,213,240,234.7C320,256,400,224,480,186.7C560,149,640,107,720,112C800,117,880,171,960,186.7C1040,203,1120,181,1200,144C1280,107,1360,53,1400,26.7L1440,0L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"></path></svg>

      <div className='herocontainer'>
        
      </div>

    </div>
  );
}

export default App;
