import React, { ReactElement, useEffect } from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'

import { fetchUser } from '../../reducers'
import { connect } from 'react-redux'
import { AppDispatch, RootState } from '../../store'
import { getToken } from '../../lib'
import { Login } from '../Login'
import { makeStyles } from '@material-ui/core/styles'

interface Props {
  userIsAuthenticated: boolean;
  fetchUsers(): void;
  error: Error;
}

const useStyles = makeStyles({
  appHeader: {
    margin: 'auto',
  },
})

const MainComponent = ({ userIsAuthenticated, fetchUsers, error }: Props): ReactElement => {
  const classes = useStyles()

  useEffect(() => {
    const token = getToken()

    if (token) {
      fetchUsers()
    }
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
      {userIsAuthenticated ? renderUser : renderLogin}
    </>
  )
}

export const Main = connect(
  (state: RootState) => ({
    userIsAuthenticated: state.user.isAuthenticated,
    error: state.user.error,
  }),
  (dispatch: AppDispatch) => ({
    fetchUsers: (): void => dispatch(fetchUser())
  })
)(MainComponent)
