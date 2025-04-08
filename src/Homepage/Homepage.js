import React, { useRef, useEffect, useState } from 'react';
import './Homepage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faArrowRight, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faFacebookF, faWhatsapp } from '@fortawesome/free-brands-svg-icons';

import teamMember1 from '../Images/prova1.png';
import teamMember2 from '../Images/prova2.png';
//import logo from '../Images/sm-reverse.png';
import logo from '../Images/logo.png';

const Homepage = () => {
  const chatInputRef = useRef(null);
  const chiSiamoTextRef = useRef(null);
  const loStudioTextRef = useRef(null);
  const pIvaTextRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sessionUUID, setSessionUUID] = useState(localStorage.getItem('sessionUUID'));
  const [isTyping, setIsTyping] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);

  const [messages, setMessages] = useState([
    { id: 1, text: "Ciao! Come posso aiutarti oggi?", isAssistant: true }
  ]);

  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    const messageContainer = document.querySelector('.chat-messages');
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Effetto per scrollare automaticamente quando vengono aggiunti nuovi messaggi
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const startSession = async () => {
    const uuid = '74eeba3552ad4cb0903ceb520cac83b6';
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0MzY2NTE0MiwianRpIjoiYTMyNDk4NmMtMjJkZS00ZmViLWE5YmYtYzNjMzg5ZDk3NTA0IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6eyJhcGlfa2V5IjoiNzQ3YzVjYjkxNTE5MzZjZjI4MzlhYzNhZDE4ZTI4MDUxYmI4NmQ1MWQxNTM2OTM3YzgxNTY1NzM3MWQzNDM3ZSJ9LCJuYmYiOjE3NDM2NjUxNDJ9.7Lpg7u7NvDrhtDXI0BBjEcKOuQ_920cmEOzIr-yJo7o';
    const url = `https://app.gpt-trainer.com/api/v1/chatbot/${uuid}/session/create`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        throw new Error("Errore di rete", response.status);
      }
      
      const data = await response.json();
      setSessionUUID(data.uuid);
      localStorage.setItem('sessionUUID', data.uuid);
      return data.uuid;
    } catch (error) {
      console.error("Errore nella creazione della sessione:", error);
      return null;
    }
  };

  const sendMessage = async (message, uuid) => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0MzY2NTE0MiwianRpIjoiYTMyNDk4NmMtMjJkZS00ZmViLWE5YmYtYzNjMzg5ZDk3NTA0IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6eyJhcGlfa2V5IjoiNzQ3YzVjYjkxNTE5MzZjZjI4MzlhYzNhZDE4ZTI4MDUxYmI4NmQ1MWQxNTM2OTM3YzgxNTY1NzM3MWQzNDM3ZSJ9LCJuYmYiOjE3NDM2NjUxNDJ9.7Lpg7u7NvDrhtDXI0BBjEcKOuQ_920cmEOzIr-yJo7o';
    const url = `https://app.gpt-trainer.com/api/v1/session/${uuid}/message/stream`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: message })
      });
      
      if (!response.ok) {
        throw new Error("Errore di rete", response.status);
      }
      
      return await response.text();
    } catch (error) {
      console.error("Errore nell'invio del messaggio:", error);
      return "Mi dispiace, si è verificato un errore. Riprova più tardi.";
    }
  };

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    // Attiva l'animazione della chat
    setIsChatActive(true);

    // Aggiungi il messaggio dell'utente
    setMessages(prev => [...prev, { 
      id: prev.length + 1, 
      text: message, 
      isAssistant: false
    }]);

    // Mostra i pallini di caricamento
    setIsTyping(true);
    setShowQuickQuestions(false);

    // Invia il messaggio al bot
    const uuid = sessionUUID || await startSession();
    if (uuid) {
      const response = await sendMessage(message, uuid);
      
      // Rimuovi i pallini e aggiungi la risposta del bot
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        id: prev.length + 1, 
        text: response, 
        isAssistant: true
      }]);
    }

    scrollToBottom();
  };

  const handleQuickQuestion = (question) => {
    handleSendMessage(question);
  };

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
      { threshold: 0.1,
       }
    );

    if (chiSiamoTextRef.current) {
      observer.observe(chiSiamoTextRef.current);
    }

    if (loStudioTextRef.current) {
      observer.observe(loStudioTextRef.current);
    }

    if (pIvaTextRef.current) {
      observer.observe(pIvaTextRef.current);
    }

    return () => {
      if (chiSiamoTextRef.current) {
        observer.unobserve(chiSiamoTextRef.current);
      }

      if (loStudioTextRef.current) {
        observer.unobserve(loStudioTextRef.current);
      }

      if (pIvaTextRef.current) {
        observer.unobserve(pIvaTextRef.current);
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

  return (
    <div className="homepage-container" id="hero-container">
      <div className="navbar">
        <div className="top-contact-bar">
          <div className="contact-location">
            Castelfranco: <span>0571 489516</span>
          </div>
          <div className="contact-location">
            Ponsacco: <span>0587 731777</span>
          </div>
        </div>
        <div className='navbar-nav'>
          <div className="navbar-logo" onClick={() => scrollTo('hero-container')}>
            <img src={logo} alt="Studio Malacarne Logo" />
          </div>
          <div className="navbar-links">
            <p onClick={() => scrollTo('hero-container')}>Home</p>
            <p onClick={() => scrollTo('chi-siamo-container')}>Chi Siamo</p>
            <p onClick={() => scrollTo('lo-studio-container')}>Lo Studio</p>
            <p onClick={() => scrollTo('p-iva-container')}>P.IVA</p>
            <p onClick={() => scrollTo('contatti-container')}>Contatti</p>
          </div>
          <div className="navbar-button">
            <FontAwesomeIcon icon={faWhatsapp} />
            <p className="navbar-button-text">Scrivici!</p>
          </div>
        </div>
      </div>

      <div className="hero-container">
        <div className={`hero-content ${isChatActive ? 'chat-active' : ''}`}>
          <p className="title">STUDIO MALACARNE</p>
          <p className="subtitle">Affidabilità e Competenza per la Tua Attività</p>
          <p className="description" onClick={handleDescriptionClick}>
            Domande? Chiedi pure <FontAwesomeIcon icon={faArrowRight} size="sm" style={{margin: '0', padding: '0'}}/>
          </p>
        </div>
        <div className={`chat-background  ${isChatActive ? 'chat-active' : ''}`}></div>
        <div className={`hero-chat ${isChatActive ? 'chat-active' : ''}`}>
          <div className="chat-messages" >
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.isAssistant ? 'assistant' : 'user'}`}>
                {message.text}
              </div>
            ))}
            {isTyping && (
              <div className="message assistant">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
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
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-container">
            <input 
              ref={chatInputRef}
              type="text" 
              placeholder="Scrivi un messaggio..." 
              className="chat-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage(e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <button 
              className="chat-send"
              onClick={() => {
                handleSendMessage(chatInputRef.current.value);
                chatInputRef.current.value = '';
              }}
            >
              Invia
            </button>
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

        <div className="p-iva-container" id="p-iva-container">
          <p className="p-iva-title">Cosa è la P.IVA?</p>
          <p className="p-iva-text" ref={pIvaTextRef}>
            La Partita IVA è un codice identificativo fondamentale per le attività commerciali e professionali in Italia. 
            Questo numero univoco di 11 cifre viene utilizzato per identificare in modo inequivocabile un'azienda o un professionista 
            nei rapporti con l'amministrazione finanziaria. È essenziale per la fatturazione, la dichiarazione dei redditi 
            e per tutti gli adempimenti fiscali previsti dalla legge italiana.
          </p>
          <a 
            href="/piva" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="scopri-piu-btn"
          >
            Scopri di più
          </a>
        </div>

      {showScrollTop && (
        <div className="scroll-to-top" onClick={scrollToTop}>
          <FontAwesomeIcon icon={faArrowUp} />
        </div>
      )}

      <footer className="footer" id="contatti-container">
        <div className="footer-container">
          <div className="footer-section">
            <img src={logo} alt="Studio Malacarne" className="footer-logo" />
            <form className="footer-contact-form">
              <input 
                type="text" 
                placeholder="Nome" 
                className="footer-input" 
              />
              <input 
                type="email" 
                placeholder="Email" 
                className="footer-input" 
              />
              <textarea 
                placeholder="Messaggio" 
                className="footer-input footer-textarea"
              ></textarea>
              <button type="submit" className="footer-submit">
                Invia Messaggio
              </button>
            </form>
          </div>

          <div className="footer-section footer-locations">
            <div className="location">
              <h3 className="location-title">Castelfranco</h3>
              <div className="location-info">
                <p>Via Example, 123 - Castelfranco</p>
                <p>Tel: +39 0571 000000</p>
                <p>Lun-Ven: 9:00-18:00</p>
              </div>
              <iframe 
                src="https://www.google.com/maps/embed?pb=..." 
                className="location-map" 
                title="Sede Castelfranco"
                loading="lazy"
              ></iframe>
            </div>
          </div>

          <div className="footer-section footer-locations">
            <div className="location">
              <h3 className="location-title">Ponsacco</h3>
              <div className="location-info">
                <p>Via Sample, 456 - Ponsacco</p>
                <p>Tel: +39 0587 000000</p>
                <p>Lun-Ven: 9:00-18:00</p>
              </div>
              <iframe 
                src="https://www.google.com/maps/embed?pb=..." 
                className="location-map" 
                title="Sede Ponsacco"
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Studio Malacarne. Tutti i diritti riservati. | P.IVA 01234567890</p>
          <p>Powered by <a href="https://www.hi-dev.it" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none', color: 'white'}}>HiDev</a></p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage; 