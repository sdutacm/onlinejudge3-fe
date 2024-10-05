import React from 'react';
import { ToastContainer, Zoom } from 'react-toastify';

class AchievementToastContainer extends React.Component {
  render() {
    return (
      <ToastContainer
        containerId="achievement"
        position="bottom-center"
        autoClose={8000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        className="achievement-toast-container"
        bodyClassName="achievement-toast-body"
        closeButton={false}
        transition={Zoom}
      />
    );
  }
}

export default AchievementToastContainer;
