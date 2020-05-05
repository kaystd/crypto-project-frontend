import React, { ReactElement } from 'react'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import AppBar from '@material-ui/core/AppBar'
import IconButton from '@material-ui/core/IconButton'
import ExitIcon from '@material-ui/icons/ExitToAppOutlined'
import { makeStyles } from '@material-ui/core/styles'
import { connect } from 'react-redux'

import { AppDispatch, RootState } from '../../store'
import { logout, User } from '../../reducers'

const useStyles = makeStyles({
  appHeader: {
    margin: 'auto',
  },
  toolbar: {
    height: 80,
  },
})

interface Props {
  user: User;
  isAuthenticated: boolean;
  logout: () => void;
}

export const AppHeaderComponent = ({ user, isAuthenticated, logout }: Props): ReactElement => {
  const classes = useStyles()

  const handleExit = (): void => {
    logout()
  }

  return (
    <AppBar position='static'>
      <Toolbar className={classes.toolbar}>
        <Typography className={classes.appHeader} variant='h6'>
          Добро пожаловать, {isAuthenticated ? user?.login : 'гость'}
        </Typography>
        {isAuthenticated && <IconButton color='inherit' onClick={handleExit}>
          <ExitIcon />
        </IconButton>}
      </Toolbar>
    </AppBar>
  )
}

export const AppHeader = connect(
  (state: RootState) => ({
    user: state.user.user,
    isAuthenticated: state.user.isAuthenticated,
    error: state.user.userError,
  }),
  (dispatch: AppDispatch) => ({
    logout: (): void => dispatch(logout())
  })
)(AppHeaderComponent)
