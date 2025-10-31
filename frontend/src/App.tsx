import './App.css';
import DetailsOrder from './components/DetailsOrder/DetailsOrder';
import DishList from './components/DishList/DishList';
import Header from './components/Header/Header';
import ThemeProvider from './components/Theme/ThemeProvider';
import {
  SelectedDishProvider,
  useSelectedDish,
} from './components/DishList/SelectedDishContext';

function AppContent() {
  const { selectedDish } = useSelectedDish();
  return (
    <>
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        {selectedDish && <DetailsOrder {...selectedDish} />}
        <Header />
        <div className='flex flex-col items-center mt-4 max-w-4xl mx-auto'>
          <DishList />
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
