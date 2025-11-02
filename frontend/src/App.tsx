import './App.css';
import DetailsOrder from './components/DetailsOrder/DetailsOrder';
import Header from './components/Header/Header';
import ThemeProvider from './components/Theme/ThemeProvider';
import {
  SelectedDishProvider,
  useSelectedDish,
} from './components/DishList/SelectedDishContext';
import Dishes from './pages/Dishes';
import Login from './pages/Login';
import { ToasterProvider } from './components/CustomToaster/ToasterContext';
import NotFound from './pages/NotFound';
import { Toaster } from 'sonner';
import Register from './pages/Register';
// import { toast } from 'sonner';

// import { CustomToaster } from './components/CustomToaster/CustomToaster.tsx';
// import { useCustomToast } from './components/CustomToaster/custom-sonner';
// import { useEffect, useRef } from 'react';

function AppContent() {
  const { selectedDish } = useSelectedDish();
  const userData = localStorage.getItem('userData');
  const isLoggedIn = userData ? JSON.parse(userData).isLoggedIn : false;

  // const customToast = useCustomToast();
  // const toastShownRef = useRef(false);
  // useEffect(() => {
  //   if (!toastShownRef.current) {
  //     customToast('', {
  //       duration: 10000,
  //       extra: (
  //         <div
  //           className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-2'
  //           role='alert'
  //         >
  //           <strong className='font-bold'>¡Pedido realizado!</strong>
  //           <span className='block sm:inline ml-2'>Gracias por su compra.</span>
  //           <div id='icon' className=''>
  //             <svg
  //               width='10'
  //               height='10'
  //               viewBox='0 0 15 15'
  //               fill='none'
  //               xmlns='http://www.w3.org/2000/svg'
  //             >
  //               <circle cx='7.5' cy='7.5' r='7.5' fill='black' />
  //               <path
  //                 d='M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z'
  //                 fill='green'
  //                 fillRule='evenodd'
  //                 clipRule='evenodd'
  //               ></path>
  //             </svg>
  //           </div>
  //         </div>
  //       ),
  //     });
  //     toastShownRef.current = true;
  //   }
  // }, [customToast]);

  return (
    <>
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        <div className='mt-[6vh] max-h-[90vh] flex flex-col p-0 m-0 overflow-y-auto self-center w-full items-center h-full'>
          {selectedDish && <DetailsOrder {...selectedDish} />}
          <Header />
          {(() => {
            if (isLoggedIn) {
              // Protected routes
              switch (window.location.pathname) {
                case '/dishes':
                  return <Dishes />;
              }
            }
            switch (window.location.pathname) {
              case '/':
              case '/login':
                return <Login />;
              case '/signup':
                return <Register />;
              default:
                return <NotFound />;
            }
          })()}
        </div>
        <Toaster position='top-center' closeButton theme='dark' />
        {/* <CustomToaster
          position='top-center'
          className='border-2 border-black bg-red-500'
          toastOptions={{
            classNames: {
              success: 'toaster-success',
              error: 'toaster-error',
              warning: 'toaster-warning',
              info: 'toaster-info',
            },
          }}
        /> */}
      </ThemeProvider>
    </>
  );
}

function App() {
  return (
    <SelectedDishProvider>
      <ToasterProvider>
        <AppContent />
      </ToasterProvider>
    </SelectedDishProvider>
  );
}

export default App;
