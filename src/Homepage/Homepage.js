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
  const textRef = useRef(null);
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

    if (textRef.current) {
      observer.observe(textRef.current);
    }

    return () => {
      if (textRef.current) {
        observer.unobserve(textRef.current);
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
          <p className="chi-siamo-text" ref={textRef}>
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