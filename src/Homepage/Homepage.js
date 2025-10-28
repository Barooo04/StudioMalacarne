import React, { useRef, useEffect, useState } from 'react';
import './Homepage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faArrowRight, faArrowUp, faHeadphones, faChartLine, faRobot, faHandsHelping, faChevronLeft, faChevronRight, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faFacebookF, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import ReactMarkdown from 'react-markdown';

import teamMember1 from '../Images/MM-nosfondo.png';
import teamMember2 from '../Images/SM-nosfondo.png';
//import logo from '../Images/sm-reverse.png';
import logo from '../Images/logoM2.png';
import logo3 from '../Images/logoM1.png';

const Homepage = () => {
  const chatInputRef = useRef(null);
  const chiSiamoTextRef = useRef(null);
  const servicesSectionRef = useRef(null);
  const loStudioTextRef = useRef(null);
  const pIvaTextRef = useRef(null);
  const methodDescriptionRef = useRef(null);
  const servicesDescriptionRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [messages, setMessages] = useState([
    { id: 1, text: "Ciao! Come posso aiutarti oggi?", isAssistant: true }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState('right'); // 'left' or 'right'
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const API = "https://servermalacarne.onrender.com/api";

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

  const extractText = (content) => {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content.map(item => item.text || item).join('\n');
    }
    return JSON.stringify(content);
  };

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    setIsChatActive(true);
    setMessages(prev => [...prev, { 
      id: prev.length + 1, 
      text: message, 
      isAssistant: false
    }]);

    setIsTyping(true);
    setShowQuickQuestions(false);

    try {
      let currentThreadId = threadId;
      
      // Prima creiamo una sessione se non esiste
      if (!currentThreadId) {
        console.log("Creazione nuova sessione con messaggio:", message);
        const sessionResponse = await fetch(`${API}/conversation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: message })
        });

        if (!sessionResponse.ok) {
          throw new Error("Errore nella creazione della sessione");
        }

        const sessionData = await sessionResponse.json();
        console.log("Risposta creazione sessione:", sessionData);
        currentThreadId = sessionData.threadId;
        setThreadId(currentThreadId);
      }

      console.log("Invio messaggio con threadId:", currentThreadId);
      console.log("Contenuto messaggio:", message);
      
      // Poi inviamo il messaggio
      const conv = await fetch(`${API}/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          threadId: currentThreadId, 
          message: message 
        })
      });

      if (!conv.ok) {
        throw new Error("Errore nella risposta del server");
      }

      const response = await conv.json();
      console.log("Risposta completa dal server:", response);

      // Troviamo l'ultimo messaggio dell'assistente
      const assistantMessage = response.messages.find(msg => msg.role === 'assistant');
      console.log("Messaggio dell'assistente:", assistantMessage);

      if (assistantMessage) {
        setIsTyping(false);
        setMessages(prev => [...prev, { 
          id: prev.length + 1, 
          text: extractText(assistantMessage.content[0]?.text?.value || assistantMessage.content), 
          isAssistant: true
        }]);

        // Analisi della conversazione
        console.log("Invio messaggi per analisi:", response.messages);
        const info = await fetch(`${API}/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            threadId: currentThreadId,
            messages: response.messages.map(msg => ({
              role: msg.role,
              content: typeof msg.content === 'string' ? msg.content : 
                      Array.isArray(msg.content) ? msg.content[0]?.text?.value || '' :
                      msg.content?.text?.value || ''
            }))
          })
        });

        let infoData;
        try {
          const text = await info.text(); // Prima otteniamo il testo della risposta
          console.log('Risposta raw dal server:', text); // Log per debug
          infoData = JSON.parse(text); // Poi proviamo a parsarlo
        } catch (error) {
          console.error('Errore nel parsing della risposta:', error);
          return;
        }

        console.log("Risultato analisi:", infoData);

        // Se la risposta è 'finished', termina la conversazione
        if (infoData.status === 'finished') {
          // Mostra il messaggio di ringraziamento
          setMessages(prev => [...prev, { 
            id: prev.length + 1, 
            text: "Grazie per averci contattato! Ti risponderemo al più presto.", 
            isAssistant: true
          }]);

          // Disabilita completamente la chat
          setIsChatActive(false);
          setShowQuickQuestions(false);
          
          // Disabilita l'input
          if (chatInputRef.current) {
            chatInputRef.current.disabled = true;
          }
          
          return;
        }

        // Se non è 'finished', continua con la conversazione
        if (infoData && typeof infoData === 'object') {
          const allFieldsFilled = Object.values(infoData).every(value => 
            value && (typeof value === 'string' ? value.trim() !== '' : true)
          );
          
          if (allFieldsFilled) {
            // Invia i dati per email
            try {
              await fetch(`${API}/send-email`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  to: 'simone@example.com',
                  subject: 'Nuovo contatto dal sito',
                  data: infoData
                })
              });
            } catch (error) {
              console.error("Errore nell'invio dell'email:", error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Errore:", error);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        id: prev.length + 1, 
        text: "Mi dispiace, si è verificato un errore. Riprova più tardi.", 
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

    if (methodDescriptionRef.current) {
      observer.observe(methodDescriptionRef.current);
    }

    if (servicesDescriptionRef.current) {
      observer.observe(servicesDescriptionRef.current);
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

      if (methodDescriptionRef.current) {
        observer.unobserve(methodDescriptionRef.current);
      }

      if (servicesDescriptionRef.current) {
        observer.unobserve(servicesDescriptionRef.current);
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

  // Funzioni per il carosello servizi
  const nextService = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSlideDirection('left');
    setCurrentServiceIndex((prevIndex) => 
      prevIndex === services.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevService = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSlideDirection('right');
    setCurrentServiceIndex((prevIndex) => 
      prevIndex === 0 ? services.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToService = (index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSlideDirection(index > currentServiceIndex ? 'left' : 'right');
    setCurrentServiceIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Array dei servizi
  const services = [
    {
      id: 1,
      title: "Consulenza fiscale e tributaria",
      description: "L'ambito fiscale rappresenta spesso una delle principali preoccupazioni per le imprese. Affianchiamo l'imprenditore in ogni fase, garantendo una corretta pianificazione fiscale, la gestione di tutti gli adempimenti e l'ottimizzazione della posizione tributaria.\n\nOffriamo un'assistenza costante per ridurre i rischi, cogliere le opportunità normative e prevenire situazioni critiche.\n\nNonostante il massimo impegno, considerando la complessità e l'incoerenza del sistema tributario, quando sorgono controversie con l'amministrazione finanziaria, è importante avere al proprio fianco un professionista competente e determinato.\n\nOffriamo assistenza completa nel contenzioso tributario, dalla fase di accertamento a quella di difesa, con l'obiettivo di tutelare al massimo gli interessi del cliente.\n\nOperiamo con competenza tecnica e strategica, riducendo i rischi e cercando sempre soluzioni efficaci."
    },
    {
      id: 2,
      title: "Consulenza societaria",
      description: "Supporto nella scelta della forma giuridica più adatta non solo in ottica fiscale, ma soprattutto per una tutela patrimoniale dei soggetti coinvolti. Come professionisti non possiamo permettere che l'impegno di una vita vada in malora a causa di un'errata scelta d'impostazione societaria fatta a monte."
    },
    {
      id: 3,
      title: "Gestione del personale dipendente",
      description: "Elaborazione paghe, adempimenti contributivi, consulenza contrattuale e non solo. Offriamo un supporto concreto nella gestione dei rapporti interni: interveniamo in caso di tensioni o conflitti tra azienda e personale, aiutando l'imprenditore a trovare soluzioni efficaci, equilibrate e rispettose dei diritti di tutte le parti coinvolte con l'obiettivo è costruire un ambiente di lavoro sereno e produttivo, prevenendo criticità che potrebbero trasformarsi in problemi più seri."
    },
    {
      id: 4,
      title: "Tenuta della contabilità",
      description: "Organizzazione e gestione contabile ordinaria e semplificata, con sistemi digitali evoluti. La corretta tenuta della contabilità non è solo un adempimento obbligatorio, ma lo strumento base che consente di monitorare l'andamento aziendale. Non ci limitiamo a \"tenere i conti\": forniamo report e analisi per aiutare l'imprenditore a capire davvero l'andamento della propria attività."
    },
    {
      id: 5,
      title: "Analisi finanziaria e studi di fattibilità",
      description: "Ogni decisione strategica richiede una base numerica solida.\n\nAttraverso strumenti di analisi finanziaria avanzati, offriamo ai nostri clienti una fotografia chiara e dettagliata della situazione economica e patrimoniale dell'impresa.\n\nPrevediamo scenari, valutiamo investimenti e individuiamo punti di forza e debolezza, per sostenere decisioni consapevoli e lungimiranti.\n\nPrima di avviare un nuovo progetto o investimento, è fondamentale valutare rischi e opportunità.\n\nRealizziamo studi di fattibilità completi e personalizzati, fornendo dati concreti e scenari realistici.\n\nAiutiamo così l'imprenditore a pianificare le proprie strategie con lucidità, evitando errori costosi e massimizzando le possibilità di successo."
    }
  ];

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
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
          </button>
          <div className="navbar-links">
            <p onClick={() => scrollTo('hero-container')}>Home</p>
            <p onClick={() => scrollTo('chi-siamo-container')}>Chi Siamo</p>
            <p onClick={() => scrollTo('services-section')}>I nostri servizi</p>
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay active" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="navbar-links mobile-menu-open" onClick={(e) => e.stopPropagation()}>
            <p onClick={() => {scrollTo('hero-container'); setIsMobileMenuOpen(false);}}>Home</p>
            <p onClick={() => {scrollTo('chi-siamo-container'); setIsMobileMenuOpen(false);}}>Chi Siamo</p>
            <p onClick={() => {scrollTo('services-section'); setIsMobileMenuOpen(false);}}>I nostri servizi</p>
            <p onClick={() => {scrollTo('lo-studio-container'); setIsMobileMenuOpen(false);}}>Lo Studio</p>
            <p onClick={() => {scrollTo('p-iva-container'); setIsMobileMenuOpen(false);}}>P.IVA</p>
            <p onClick={() => {scrollTo('contatti-container'); setIsMobileMenuOpen(false);}}>Contatti</p>
            <a
              className="mobile-whatsapp-btn"
              href="https://wa.me/393331234567"
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faWhatsapp} />
              <span>Scrivici su WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      <div className="hero-container">
        <div className={`hero-content ${isChatActive ? 'chat-active' : ''}`}>
          <img src={logo3} alt="Studio Malacarne Logo Esteso" className="hero-logo" />
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
                {message.isAssistant ? (
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                ) : (
                  message.text
                )}
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
          <h2 className="chi-siamo-title">Chi Siamo</h2>
          <p className="chi-siamo-text" ref={chiSiamoTextRef}>
            Siamo due fratelli, dottori commercialisti uniti da una visione comune: rendere la gestione d'impresa semplice e senza perdite di tempo.
            <br /><br />
            Operiamo in un contesto dove gestire un'attività oggi significa affrontare quotidianamente sfide quasi impossibili: burocrazia, scadenze, norme in continua evoluzione e decisioni da prendere in tempi rapidi.
            <br /><br />
            Il nostro obiettivo è liberare l'imprenditore dal peso degli adempimenti, permettendogli di pensare esclusivamente a come far crescere la propria impresa.
            <br /><br />
            Ci occupiamo di ogni aspetto fiscale, contabile e amministrativo, offrendo strumenti moderni e supporto costante. Vogliamo che ogni imprenditore possa dedicare tempo ed energie al proprio lavoro, senza preoccuparsi della burocrazia.
            <br /><br />
            <strong style={{color: '#248193'}}>La nostra filosofia?</strong><br />
            Trasformare la complessità amministrativa e fiscale in un processo semplice, efficiente e trasparente!
          </p>
        </div>
        <div className="chi-siamo-image">
          <div className="team-member">
            <div className="image-container">
              <img src={teamMember1} alt="Team member 1" />
            </div>
            <h3>Dott. Marco Malacarne</h3>
            <p>Laureato in Economia e Commercio presso l'università di Pisa, specializzato in consulenza aziendale, analisi finanziaria e gestione del personale</p>
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
            <h3>Dott. Simone Malacarne</h3>
            <p>Laureato in Economia e Commercio presso l'università di Pisa, specializzato in consulenza societaria, operazioni straordinarie e revisione legale</p>
            <div className="social-icons">
              <FontAwesomeIcon icon={faLinkedin} />
              <FontAwesomeIcon icon={faFacebookF} />
              <FontAwesomeIcon icon={faWhatsapp} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Sezione metodo di lavoro */}
      <div className="method-section">
        <div className="method-content">
          <h2 className="method-title">Il nostro metodo di lavoro</h2>
          <div className="method-description" ref={methodDescriptionRef}>
            <p>
              Crediamo in un approccio moderno e tecnologico, ma radicato in valori solidi: professionalità, disponibilità e attenzione alle persone.
              <br /><br />
              Non solo numeri e adempimenti, ma relazioni di fiducia e strategie concrete per accompagnare la crescita delle imprese.
              <br /><br />
              Tecnologia, disponibilità e competenza sono gli strumenti con cui costruiamo ogni giorno relazioni di fiducia con i nostri clienti.
            </p>
          </div>
          
          <div className="method-cards">
            <div className="method-card">
              <div className="method-card-icon">
                <FontAwesomeIcon icon={faHeadphones} />
              </div>
              <h3>Ascolto</h3>
              <p>Partiamo sempre dalle esigenze specifiche di ogni cliente.</p>
            </div>
            
            <div className="method-card">
              <div className="method-card-icon">
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              <h3>Pianificazione</h3>
              <p>Costruiamo strategie fiscali e amministrative personalizzate.</p>
            </div>
            
            <div className="method-card">
              <div className="method-card-icon">
                <FontAwesomeIcon icon={faRobot} />
              </div>
              <h3>Automazione</h3>
              <p>Utilizziamo strumenti digitali per ridurre tempi e margini d'errore.</p>
            </div>
            
            <div className="method-card">
              <div className="method-card-icon">
                <FontAwesomeIcon icon={faHandsHelping} />
              </div>
              <h3>Supporto costante</h3>
              <p>Siamo sempre disponibili, non solo a scadenze.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sezione I nostri servizi */}
      <div className="services-section" id="services-section" ref={servicesSectionRef}>
        <div className="services-content">
          <h2 className="services-title">I nostri servizi</h2>
          <div className="services-description" ref={servicesDescriptionRef}>
            <p>
              Offriamo un'ampia gamma di servizi professionali per supportare le aziende in ogni aspetto della loro attività. 
              La nostra esperienza e competenza ci permettono di fornire soluzioni personalizzate che rispondono alle esigenze specifiche di ogni cliente.
            </p>
          </div>
          
          <div className="simple-carousel">
            <button className="carousel-arrow carousel-arrow-left" onClick={prevService}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            
            <div className="carousel-wrapper">
              <div 
                key={currentServiceIndex}
                className={`carousel-slide slide-${slideDirection}`}
              >
                <div className="service-card">
                  <h3 className="service-title">{services[currentServiceIndex].title}</h3>
                  <p className="service-description">{services[currentServiceIndex].description}</p>
                </div>
              </div>
            </div>
            
            <button className="carousel-arrow carousel-arrow-right" onClick={nextService}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
          
          <div className="carousel-indicators">
            {services.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentServiceIndex ? 'active' : ''}`}
                onClick={() => goToService(index)}
              />
            ))}
          </div>
        </div>
      </div>

        <div className="lo-studio-container" id="lo-studio-container">
          <div className="lo-studio-content">
            <h2 className="lo-studio-title">Lo Studio</h2>
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
            <div className="studio-content studio-content-castelfranco">
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
            <div className="studio-content studio-content-ponsacco">
              <h2 className="studio-title">Ponsacco</h2>
              <p className="studio-description">
                La sede di Ponsacco è il nostro centro specializzato nella gestione contabile 
                e nella consulenza del lavoro. Il nostro team di esperti è pronto ad assistere 
                professionisti e aziende con servizi mirati e consulenza specialistica.
              </p>
              <a href="tel:+390587000000" className="studio-phone">
                <FontAwesomeIcon icon={faPhone} />
                +39 0587 000000
              </a>
            </div>
          </div>
        </div>

        <div className="p-iva-container" id="p-iva-container">
          <div className="p-iva-content">
            <h2 className="p-iva-title">Cosa è la P.IVA?</h2>
            <p className="p-iva-text" ref={pIvaTextRef}>
              La Partita IVA è un codice identificativo fondamentale per le attività commerciali e professionali in Italia. 
              Questo numero univoco di 11 cifre viene utilizzato per identificare in modo inequivocabile un'azienda o un professionista 
              nei rapporti con l'amministrazione finanziaria. È essenziale per la fatturazione, la dichiarazione dei redditi 
              e per tutti gli adempimenti fiscali previsti dalla legge italiana.
            </p>
          </div>
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
          <p>Powered by <a href="https://www.webbitz.it" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none', color: 'white'}}>Webbitz</a></p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage; 