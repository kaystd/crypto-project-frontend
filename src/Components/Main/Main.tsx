import React, { ReactElement, useEffect } from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import { connect } from 'react-redux'

import { fetchUser, LoadingState } from '../../reducers'
import { AppDispatch, RootState } from '../../store'
import { Login } from '../Login'
import { User } from '../User'
import { AppHeader } from '../AppHeader'

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
  useEffect(() => {
    fetchUser()
  }, [])

  const renderAppBar = (
    <AppHeader />
  )

  const renderLogin = (
    <Login />
  )

  const renderUser = (
    <User />
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
