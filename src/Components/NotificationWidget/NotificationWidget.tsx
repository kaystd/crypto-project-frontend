import React, { ReactElement } from 'react'
import Snackbar from '@material-ui/core/Snackbar'
import { connect } from 'react-redux'

import { AppDispatch, RootState } from '../../store'
import { changeNotificationState } from '../../reducers'

interface Props {
  message: string;
  delay: number;
  open: boolean;
  changeWidgetState: (show: boolean) => void;
}

export const NotificationWidgetComponent = ({ open, message, delay, changeWidgetState }: Props): ReactElement => {
  const handleClose = (): void => {
    changeWidgetState(false)
  }

  return (
    <Snackbar
      open={open}
      message={message}
      autoHideDuration={delay}
      onClose={handleClose}
    />
  )
}

export const NotificationWidget = connect(
  (state: RootState) => ({
    message: state.notification.message,
    delay: state.notification.delay,
    timestamp: state.notification.timestamp,
    open: state.notification.open,
  }),
  ((dispatch: AppDispatch) => ({
    changeWidgetState: (show: boolean) => dispatch(changeNotificationState(show))
  }))
)(NotificationWidgetComponent)
