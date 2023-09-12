import './App.css';
import { ReactComponent as Cubes } from './assests/deployed_code_FILL0_wght400_GRAD0_opsz48.svg';
import {ReactComponent as Jslogo} from './assests/javascript_FILL0_wght400_GRAD0_opsz48.svg';
import {ReactComponent as Terminallogo} from './assests/terminal_FILL0_wght400_GRAD0_opsz48.svg';
import {ReactComponent as Hooklogo} from './assests/webhook_FILL0_wght400_GRAD0_opsz48.svg';
import {ReactComponent as Bracketlogo} from './assests/code_FILL0_wght400_GRAD0_opsz48.svg';
import {ReactComponent as Htmlogo} from './assests/html_FILL0_wght400_GRAD0_opsz48.svg';
import {ReactComponent as Mobdevlogo} from './assests/developer_mode_FILL0_wght400_GRAD0_opsz48.svg';
import { ReactComponent as Namelogo } from './assests/motion_mode_FILL0_wght400_GRAD0_opsz48.svg';
import { ReactComponent as Starsvg } from './assests/brightness_empty_FILL0_wght400_GRAD0_opsz48.svg';
import { ReactComponent as Starcreative } from './assests/magic_button_FILL0_wght400_GRAD0_opsz48.svg';
import p1 from './assests/projectimg/Homescreen.png';
import p2 from './assests/projectimg/p2-lecs.jpg';
import p3 from './assests/projectimg/p3-genre.png';
import p4 from './assests/projectimg/affordybot.jpg';
import p5 from './assests/projectimg/cesa.png';

import {ReactComponent as FallGuy} from './assests/MessyDoodle.svg';

import l1 from './assests/logos/react-js.png';
import l2 from './assests/logos/JavaScript-logo.png';
import l3 from './assests/logos/express.png';
import l4 from './assests/logos/mongo.png';
import l5 from './assests/logos/nodejs-logo.png';
import l6 from './assests/logos/cpp.png';
import l7 from './assests/logos/python.png';
import l8 from './assests/logos/java.png';
import l9 from './assests/logos/firebase.png';
import l10 from './assests/logos/linux.png';
import l11 from './assests/logos/jquery.png';
import l12 from './assests/logos/postman.png';
import l13 from './assests/logos/mysql.png';
import l14 from './assests/logos/arduino.png';
import l15 from './assests/logos/cordova.png';
import l16 from './assests/logos/git.png';
import l17 from './assests/logos/nextjs.png';
import l18 from './assests/logos/bash.png';
import l19 from './assests/logos/bootstrap.png';


// Fredericka the Great

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
        <nav>
          <div className='namelogo'>
            <Namelogo fill='#E64D33' style={{ height: 50, width: 50 }} id="namelogo"/>
            <p className='namehead'>PRATHMESH INGOLE</p>
          </div>
          <div className='nav-buttons'>
              <a href='#home' className='nav-btn'>HOME</a>
              <a href='#about' className='nav-btn'>ABOUT</a>
              <a href='#projects' className='nav-btn'>PROJECTS</a>

          </div>
          <div className='letstalkcontainer'>
              <p className='letstalkbutton'>
                LET'S TALK
              </p>
          </div>
        </nav>

        <div className='restcontainer'>
            <div className='hero' id="home">
              {/* <div className='noisefilter'></div> */}
              <div className='herotext1'>Hi, I'm a <span id="gradienttext">creative</span> <Starcreative style={{ height: 60, width: 60 }} id="herotextsvg"/> developer based in Pune</div>
              <FallGuy fill='#E64D33' style={{ height:443, width: 443 , position: 'absolute', right: '-10px', bottom:'-50px',transform:"scale(-1,1)"}} id="fallguy"/>
            </div>
          
            <div className='blackstrip'>
            <Starsvg fill='#E64D33' style={{ height: 50, width: 50 }} id="stripstars"/>
            <p>DATA STRUCTURE</p>
            <Starsvg fill='#E64D33' style={{ height: 50, width: 50 }} id="stripstars"/>
            <p>DATABASE</p>
            <Starsvg fill='#E64D33' style={{ height: 50, width: 50 }} id="stripstars"/>
            <p>GIT</p>
            <Starsvg fill='#E64D33' style={{ height: 50, width: 50 }} id="stripstars"/>
            <p>WEB</p>
            <Starsvg fill='#E64D33' style={{ height: 50, width: 50 }} id="stripstars"/>
            <p>ALGORITHMS</p>
            </div>


            <p className='projectHeader' id='projects'>Projects</p>
            <div className="aboutContainer">
              <div className="aboutContainerFilter"></div>
                  <div className='projectStrip'>
                    <div className="projectContainer" style={{ backgroundColor : '#1a031765'}}><div className='projectImg' style={{ backgroundImage : `url(${p1})`}}></div><p className="projectName">Animephile</p><p className='projectDescription'>A reminder for new releases of anime episode</p><div className='projectMoreBtn' onClick={()=> window.open("https://github.com/IORD1/Animephile", "_blank")}>View more</div></div>
                    <div className="projectContainer" style={{ backgroundColor : '#a4c4b56b'}}><div className='projectImg' style={{ backgroundImage : `url(${p2})`}}></div><p className="projectName">LECS Chat App</p><p className='projectDescription'>A chat app underdevelopment using lec signaturing</p><div className='projectMoreBtn' onClick={()=> window.open("https://github.com/IORD1/LECS-chat", "_blank")}>View more</div></div>
                    <div className="projectContainer" style={{ backgroundColor : 'rgba(151, 150, 150, 0.479)'}}><div className='projectImg' style={{ backgroundImage : `url(${p5})`}}></div><p className="projectName">CESA Website</p><p className='projectDescription'>Built Homescreen of Computer Engineering Student Association</p><div className='projectMoreBtn'onClick={()=> window.open("https://github.com/777ahesh/cesa", "_blank")}>View more</div></div>
                    <div className="projectContainer" style={{ backgroundColor : 'rgba(151, 150, 150, 0.479)'}}><div className='projectImg' style={{ backgroundImage : `url(${p4})`}}></div><p className="projectName">Calculate Optimal EMI</p><p className='projectDescription'>A FinHack submittion that suggest if user should purchase property for given EMI options</p><div className='projectMoreBtn' onClick={()=> window.open("https://devpost.com/software/affordybot", "_blank")}>View more</div></div>
                    <div className="projectContainer" style={{ backgroundColor : '#8becff67'}}><div className='projectImg' style={{ backgroundImage : `url(${p3})`}}></div><p className="projectName">Movie Genre Classifier</p><p className='projectDescription'>Data science project to categorize movies based on it's overview into genres</p><div className='projectMoreBtn' onClick={()=> window.open("https://github.com/IORD1/GenrePredictor", "_blank")}>View more</div></div>

                  </div>
            </div>

            <p className='projectHeader' id='about'>My Tech Stack</p>
            <div className="aboutContainer smallAboutContainer">
              <div className="aboutContainerFilter"></div>
              <div className='logoHolder'>
                
                <div className='logoRow'>
                  <div className='logoBox'><img src={l1} alt="technologies i know"></img></div>
                  <div className='logoBox'><img src={l2} alt="technologies i know"></img></div>
                  <div className='logoBox'><img src={l5} alt="technologies i know"></img></div>
                  <div className='logoBox'><img src={l9} alt="technologies i know"></img></div>
                  <div className='logoBox'><img src={l11} alt="technologies i know"></img></div>
                  <div className='logoBox'><img src={l12} alt="technologies i know"></img></div>
                  <div className='logoBox'><img src={l19} alt="technologies i know"></img></div>

                </div>
                <div className='logoRow'>
                  <div className='logoBox bigBox'><img src={l3} alt="technologies i know" ></img></div>
                  <div className='logoBox bigBox'><img src={l4} alt="technologies i know"></img></div>
                  <div className='logoBox bigBox'><img src={l13} alt="technologies i know"></img></div>
                  <div className='logoBox bigBox'><img src={l15} alt="technologies i know"></img></div>
                  <div className='logoBox bigBox'><img src={l17} alt="technologies i know"></img></div>
                </div>
                <div className='logoRow'>
                  <div className='logoBox'><img src={l6} alt="technologies i know"></img></div>
                  <div className='logoBox'><img src={l7} alt="technologies i know"></img></div>
                  <div className='logoBox'><img src={l8} alt="technologies i know"></img></div>
                  <div className='logoBox'><img src={l10} alt="technologies i know"></img></div>
                  <div className='logoBox'><img src={l14} alt="technologies i know"></img></div>
                  <div className='logoBox'><img src={l16} alt="technologies i know"></img></div>
                  <div className='logoBox'><img src={l18} alt="technologies i know"></img></div>
                </div>
              </div>
            </div>

            <p className='projectHeader'>Worked with</p>
            <div className="someContainer">
            <div className="someContainerFilter"></div>

              <>IOFT</>
              <>Colege group</>
              
            </div>


          


        </div>

      </div>

    </div>
  );
}

export default App;
