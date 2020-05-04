import React, { ReactElement, useEffect } from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import { makeStyles } from '@material-ui/core/styles'
import { connect } from 'react-redux'

import { fetchUser, LoadingState } from '../../reducers'
import { AppDispatch, RootState } from '../../store'
import { getToken } from '../../lib'
import { Login } from '../Login'
import { RegistrationComponent } from '../Registration'

interface Props {
  loading: LoadingState;
  userIsAuthenticated: boolean;
  fetchUser(): void;
  error: Error;
}

const useStyles = makeStyles({
  appHeader: {
    margin: 'auto',
  },
  preloader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1 0 auto',
  },
})

const MainComponent = ({ loading, userIsAuthenticated, fetchUser, error }: Props): ReactElement => {
  const classes = useStyles()

  useEffect(() => {
    fetchUser()
  }, [])

  const renderAppBar = (
    <AppBar position='static'>
      <Toolbar>
        <Typography className={classes.appHeader} variant='h6'>Добро пожаловать!</Typography>
      </Toolbar>
    </AppBar>
  )

  const renderLogin = (
    <Login />
  )

  const renderUser = (
    <div>
      User
    </div>
  )

  return (
    <>
      {renderAppBar}
      {loading === LoadingState.Finish
        ? userIsAuthenticated
          ? renderUser
          : renderLogin
        : null}
    </>
  )
}

export const Main = connect(
  (state: RootState) => ({
    loading: state.user.fetchingUser,
    userIsAuthenticated: state.user.isAuthenticated,
    error: state.user.error,
  }),
  (dispatch: AppDispatch) => ({
    fetchUser: (): void => dispatch(fetchUser())
  })
)(MainComponent)
