import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import PopupWithForm from "./PopupWithForm";
import ImagePopup from "./ImagePopup";
import { useState, useEffect } from "react";
import api from "../utils/api";
import Login from "./Login.js";
import Register from "./Register";
import ProtectedRoute from "./ProtectedRoute";
import InfoTooltip from "./InfoTooltip";

import DeleteConfirmPopup from "./DeleteConfirmPopup";
import EditProfilePopup from "./EditProfilePopup";
import RenewAvatarPopup from "./RenewAvatarPopup";
import AddCardPopup from "./AddCardPopup";
import MenuWithBurger from "./MenuWithBurger";

import { CurrentUserContext } from "../contexts/CurrentUserContext";
import { Switch, Route, useHistory, Redirect } from "react-router-dom";
import * as auth from "../utils/auth";

function App() {
  const [isAvatarPopup, setAvatarPopup] = useState(false);
  const [isProfileEditPopup, setProfileEditPopup] = useState(false);
  const [isConfirmPopupOpen, setConfirmPopupOpen] = useState(false);
  const [isAddCardPopup, setAddCardPopup] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const history = useHistory();
  const [isInfoTooltipOpen, setInfoTooltipOpen] = useState(false);
  const [status, setStatus] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [deleteCard, setDeleteCard] = useState(null)

  useEffect(() => {
    loggedIn &&
      Promise.all([api.getUserData(), api.getInitialCards()])
        .then(([data, cards]) => {
          setCurrentUser(data);
          setCards(cards);
        })
        .catch((err) => {
          console.log(err);
        });
  }, [loggedIn]);

  useEffect(() => {
    const jwt = localStorage.getItem("token");
    if (jwt) {
      auth
        .checkToken(jwt)
        .then((res) => {
          setEmail(res.data.email);
          setLoggedIn(true);
          history.push("/");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [history]);

  function handleEditAvatarClick() {
    setAvatarPopup(true);
  }

  function handleEditProfileClick() {
    setProfileEditPopup(true);
  }

  function handleAddPlaceClick() {
    setAddCardPopup(true);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
  }

  function handleConfirmPopupClick() {
    setConfirmPopupOpen(true);
  }

  function closeAllPopups() {
    setAvatarPopup(false);
    setProfileEditPopup(false);
    setAddCardPopup(false);
    setSelectedCard({});
    setInfoTooltipOpen(false);
  }

  useEffect(() => {
    const closeOverlay = (evt) => {
      if (evt.target.classList.contains("popup")) {
        closeAllPopups();
      }
    };
    document.addEventListener("mousedown", closeOverlay);

    return () => document.removeEventListener("mousedown", closeOverlay);
  }, []);

  function handleMenuClick() {
    setMenuOpen(!isMenuOpen);
  }

  function handleCardLike(cards) {
    // We check again if there is already a like on this card
    const isLiked = cards.likes.some((i) => i._id === currentUser._id);

    // We send a request to the API and get the updated card data
    api
      .changeLikeCardStatus(cards._id, !isLiked)
      .then((newCard) => {
        setCards((state) =>
          state.map((c) => (c._id === cards._id ? newCard : c))
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const isOpen =
    setAvatarPopup ||
    setProfileEditPopup ||
    setAddCardPopup ||
    selectedCard.link;

  useEffect(() => {
    function closeByEscape(evt) {
      if (evt.key === "Escape") {
        closeAllPopups();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", closeByEscape);
      return () => {
        document.removeEventListener("keydown", closeByEscape);
      };
    }
  }, [isOpen]);

  function handleDeleteCard(card) {
    api
      .deleteCard(card._id)
      .then(() => {
        setCards((cards) =>
          cards.filter((item) => {
            //create a copy of the array, excluding the removed card from it
            return item._id !== card._id;
          })
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleUpdateUser(data) {
    api
      .setUserData(data.name, data.about)
      .then((data) => {
        setCurrentUser(data);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleUpdateAvatar(data) {
    api
      .setAva(data)
      .then((dataAvatar) => {
        setCurrentUser(dataAvatar);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleUpdateCard(card) {
    api
      .createCard(card)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      });
  }
  function handleRegistration(email, password) {
    console.log(email);
    auth
      .register(email, password)
      .then((data) => {
        if (data) {
          setStatus(true);
          setInfoTooltipOpen(true);
          history.push("/sign-in");
        }
      })
      .catch((err) => {
        setStatus(false);
        setInfoTooltipOpen(true);
        console.log(err);
      });
  }

  function handleLogin(email, password) {
    auth
      .login(email, password)
      .then((data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          setEmail(email);
          setLoggedIn(true);
          history.push("/");
        }
      })
      .catch((err) => {
        setInfoTooltipOpen(true);
        console.log(err);
      });
  }

  function handleLogOut() {
    localStorage.removeItem("token");
    setLoggedIn(false);
    history.push("/sign-in");
    setMenuOpen(!isMenuOpen);
  }

  function handleDeleteCardClick(card) {
    setDeleteCard(card._id);
    setConfirmPopupOpen(true);
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="App">
        <MenuWithBurger
          isOpen={isMenuOpen}
          onClose={closeAllPopups}
          onLogOut={handleLogOut}
          email={email}
        />

        <div className="page center">
          <Header
            onLogOut={handleLogOut}
            email={email}
            loggedIn={loggedIn}
            onBurger={handleMenuClick}
          />

          <Switch>
            <ProtectedRoute
              exact
              path="/"
              onRenewAvatar={handleEditAvatarClick}
              onEditProfile={handleEditProfileClick}
              onAddCard={handleAddPlaceClick}
              onConfirmCard={handleConfirmPopupClick}
              onCardClick={handleCardClick}
              handleCardLike={handleCardLike}
              handleDeleteCard={handleDeleteCard}
              cards={cards}
              component={Main}
              loggedIn={loggedIn}
            />

            <Route path="/sign-in">
              <Login handleLogin={handleLogin} />
            </Route>

            <Route path="/sign-up">
              <Register handleRegistration={handleRegistration} />
            </Route>

            <Route path='*'>
              {loggedIn ? <Redirect to='/' /> : <Redirect to ='/sign-in' />}
            </Route>
          </Switch>

          {loggedIn && <Footer />}

          <Footer />

          <EditProfilePopup
            isOpen={isProfileEditPopup}
            onClose={closeAllPopups}
            onUpdateUser={handleUpdateUser}
          />

          <AddCardPopup
            isOpen={isAddCardPopup}
            onClose={closeAllPopups}
            onAddCard={handleUpdateCard}
          />

          <RenewAvatarPopup
            isOpen={isAvatarPopup}
            onClose={closeAllPopups}
            onUpdateAvatar={handleUpdateAvatar}
          />

          <ImagePopup onClose={closeAllPopups} card={selectedCard} />

          <PopupWithForm
            name="popup_type_sure"
            title="Вы уверены?"
            buttonText="Да"
          />

          <DeleteConfirmPopup>
            isOpen={isConfirmPopupOpen}
            onClose={closeAllPopups}
            handleCardDelete={handleDeleteCardClick}
            deleteCard={deleteCard}
          </DeleteConfirmPopup>
          
          <InfoTooltip
            isOpen={isInfoTooltipOpen}
            status={status}
            onClose={closeAllPopups}
          />
        </div>
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
