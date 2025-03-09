import React, { useState, useRef, useEffect } from 'react';
import './Homepage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faArrowRight, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faFacebookF, faWhatsapp } from '@fortawesome/free-brands-svg-icons';

import teamMember1 from '../Images/prova1.png';
import teamMember2 from '../Images/prova2.png';

const Homepage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Ciao! Chiedimi tutto quello di cui hai bisogno!😊",
      isAssistant: true
    }
  ]);
  
  const chatInputRef = useRef(null);
  const chiSiamoTextRef = useRef(null);
  const loStudioTextRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);


  const handleDescriptionClick = () => {
    chatInputRef.current.focus();
  };

  const scrollTo = (sectionId) => {
    const section = document.getElementById(sectionId);
    section.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (chiSiamoTextRef.current) {
      observer.observe(chiSiamoTextRef.current);
    }

    if (loStudioTextRef.current) {
      observer.observe(loStudioTextRef.current);
    }

    return () => {
      if (chiSiamoTextRef.current) {
        observer.unobserve(chiSiamoTextRef.current);
      }

      if (loStudioTextRef.current) {
        observer.unobserve(loStudioTextRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleQuickQuestion = (question) => {
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text: question,
      isAssistant: false
    }]);
    setShowQuickQuestions(false);
  };


  return (
    <div className="homepage-container" id="hero-container">
      <div className="navbar">
        <div className="navbar-logo">
          <p>LOGO</p>
        </div>
        <div className="navbar-links">
          <p onClick={() => scrollTo('hero-container')}>Home</p>
          <p onClick={() => scrollTo('chi-siamo-container')}>Chi Siamo</p>
          <p onClick={() => scrollTo('lo-studio-container')}>Lo Studio</p>
          <p onClick={() => scrollTo('p-iva-container')}>P.IVA</p>
          <p onClick={() => scrollTo('contatti-container')}>Contatti</p>
        </div>
        <div className="navbar-contacts">
          <FontAwesomeIcon className="phone-icon-text" icon={faPhone} />
          <p className="phone-icon-text">+39 339 1234567</p>
        </div>
      </div>

      <div className="hero-container">
        <div className="hero-content">
          <p className="title">STUDIO MALACARNE</p>
          <p className="subtitle">Affidabilità e Competenza <br /> per la Tua Attività</p>
          <p className="description" onClick={handleDescriptionClick}>
            Domande? Chiedi pure <FontAwesomeIcon icon={faArrowRight} size="sm" style={{margin: '0', padding: '0'}}/>
          </p>
        </div>
        <div className="hero-chat">
          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.isAssistant ? 'assistant' : 'user'}`}>
                {message.text}
              </div>
            ))}
            {showQuickQuestions && (
              <div className="quick-questions">
                <p className="quick-questions-title">Domande Frequenti:</p>
                <div className="quick-questions-buttons">
                  <button onClick={() => handleQuickQuestion("Cosa è un forfettario?")}>
                    Cosa è un forfettario?
                  </button>
                  <button onClick={() => handleQuickQuestion("Vorrei aprire un'attività")}>
                    Vorrei aprire un'attività
                  </button>
                  <button onClick={() => handleQuickQuestion("Quali sono i servizi che offrite?")}>
                    Quali sono i servizi che offrite?
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="chat-input-container">
            <input 
              ref={chatInputRef}
              type="text" 
              placeholder="Scrivi un messaggio..." 
              className="chat-input"
            />
            <button className="chat-send">Invia</button>
          </div>
        </div>
      </div>

      <div className="chi-siamo-container" id="chi-siamo-container">
        <div className="chi-siamo-content">
          <p className="chi-siamo-title">Chi Siamo</p>
          <p className="chi-siamo-text" ref={chiSiamoTextRef}>
            Lo Studio Malacarne nasce dalla passione e dall'esperienza di due fratelli, uniti dalla stessa visione: offrire consulenza professionale su misura per aziende e professionisti.<br />

            Con sedi a Castelfranco e Ponsacco, il nostro studio combina competenze specialistiche in settori diversi per garantire un servizio completo e personalizzato.<br />

            La sede di Castelfranco si occupa principalmente di [settore di specializzazione].<br />
            La sede di Ponsacco è specializzata in [altro settore di specializzazione].<br />

            Grazie alla nostra sinergia e a un approccio innovativo, affianchiamo i nostri clienti nella gestione fiscale, contabile e strategica, aiutandoli a raggiungere i loro obiettivi con sicurezza e serenità.<br />

            Contattaci per scoprire come possiamo supportare il tuo business!</p>
        </div>
        <div className="chi-siamo-image">
          <div className="team-member">
            <div className="image-container">
              <img src={teamMember1} alt="Team member 1" />
            </div>
            <h3>Nome Cognome</h3>
            <p>Breve descrizione del ruolo e delle competenze della persona</p>
            <div className="social-icons">
              <FontAwesomeIcon icon={faLinkedin} />
              <FontAwesomeIcon icon={faFacebookF} />
              <FontAwesomeIcon icon={faWhatsapp} />
            </div>
          </div>
          <div className="team-member">
            <div className="image-container">
              <img src={teamMember2} alt="Team member 2" />
            </div>
            <h3>Nome Cognome</h3>
            <p>Breve descrizione del ruolo e delle competenze della persona</p>
            <div className="social-icons">
              <FontAwesomeIcon icon={faLinkedin} />
              <FontAwesomeIcon icon={faFacebookF} />
              <FontAwesomeIcon icon={faWhatsapp} />
            </div>
          </div>
        </div>

        <div className="lo-studio-container" id="lo-studio-container">
          <div className="lo-studio-content">
            <p className="lo-studio-title">Lo Studio</p>
            <p className="lo-studio-text" ref={loStudioTextRef}>
              Il nostro studio professionale si articola in due sedi strategicamente posizionate per servire al meglio la nostra clientela. La sede storica di Castelfranco, specializzata nella consulenza fiscale e tributaria per le piccole e medie imprese, e la sede di Ponsacco, focalizzata sulla gestione contabile e sulla consulenza del lavoro. Questa duplice presenza ci permette di offrire un servizio completo e specializzato, combinando l'expertise di entrambe le sedi per garantire soluzioni personalizzate per ogni cliente.
            </p>
          </div>
          <div className="lo-studio-castelfranco">
            <img 
              src="/studio-castelfranco.jpg" 
              alt="Studio Castelfranco" 
              className="studio-image"
            />
            <div className="studio-content" style={{marginLeft: '20px'}}>
              <h2 className="studio-title">Castelfranco</h2>
              <p className="studio-description">
                La nostra sede storica di Castelfranco è specializzata nella consulenza fiscale 
                e tributaria per le piccole e medie imprese. Con anni di esperienza nel settore, 
                offriamo soluzioni personalizzate per ogni esigenza aziendale.
              </p>
              <a href="tel:+390571000000" className="studio-phone">
                <FontAwesomeIcon icon={faPhone} />
                +39 0571 000000
              </a>
            </div>
          </div>

          <div className="lo-studio-ponsacco">
            <img 
              src="/studio-ponsacco.jpg" 
              alt="Studio Ponsacco" 
              className="studio-image"
            />
            <div className="studio-content" style={{marginRight: '20px', textAlign: 'right'}}>
              <h2 className="studio-title">Ponsacco</h2>
              <p className="studio-description">
                La sede di Ponsacco è il nostro centro specializzato nella gestione contabile 
                e nella consulenza del lavoro. Il nostro team di esperti è pronto ad assistere 
                professionisti e aziende con servizi mirati e consulenza specialistica.
              </p>
              <a href="tel:+390587000000" className="studio-phone" style={{marginLeft: 'auto'}}>
                <FontAwesomeIcon icon={faPhone} />
                +39 0587 000000
              </a>
            </div>
          </div>
        </div>
      </div>

      {showScrollTop && (
        <div className="scroll-to-top" onClick={scrollToTop}>
          <FontAwesomeIcon icon={faArrowUp} />
        </div>
      )}
    </div>
  );
};

export default Homepage; 