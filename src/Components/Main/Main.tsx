import React, { ReactElement, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { connect } from 'react-redux'

import { fetchUser, LoadingState, User as UserModel } from '../../reducers'
import { AppDispatch, RootState } from '../../store'
import { Login } from '../Login'
import { User } from '../User'
import { AppHeader } from '../AppHeader'
import { Admin } from '../Admin'

interface Props {
  user: UserModel;
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

const MainComponent = ({ user, loading, userIsAuthenticated, fetchUser, error }: Props): ReactElement => {
  useEffect(() => {
    fetchUser()
  }, [])

  const renderAppBar = (
    <AppHeader />
  )

  const renderLogin = (
    <Login />
  )

  const renderUser = user?.login === 'Admin' ? <Admin /> : <User />

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
    user: state.user.user,
    loading: state.user.fetchingUser,
    userIsAuthenticated: state.user.isAuthenticated,
    error: state.user.userError,
  }),
  (dispatch: AppDispatch) => ({
    fetchUser: (): void => dispatch(fetchUser())
  })
)(MainComponent)
