import './App.css';
import DetailsOrder from './components/DetailsOrder/DetailsOrder';
import Header from './components/Header/Header';
import ThemeProvider from './components/Theme/ThemeProvider';
import {
  SelectedDishProvider,
  useSelectedDish,
} from './components/DishList/SelectedDishContext';
import Dishes from './pages/Dishes';
import Loader from './components/Loader/Loader';
import { Login } from './pages/Login';

function AppContent() {
  const { selectedDish } = useSelectedDish();

  return (
    <>
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        <div className='mt-[6vh] max-h-[90vh] flex flex-col p-0 m-0 overflow-y-auto self-center w-full items-center h-full'>
          {selectedDish && <DetailsOrder {...selectedDish} />}
          <Header />
          {(() => {
            switch (window.location.pathname) {
              case '/':
                return <Login />;
              case '/dishes':
                return <Dishes />;
              default:
                return <Loader />;
            }
          })()}
        </div>
      </ThemeProvider>
    </>
  );
}

function App() {
  return (
    <SelectedDishProvider>
      <AppContent />
    </SelectedDishProvider>
  );
}

export default App;
