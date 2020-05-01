import React, { ChangeEvent, ReactElement, useState } from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { connect } from 'react-redux'
import { AppDispatch, RootState } from '../../store'
import { login } from '../../reducers'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '1 0 auto',
    },
    form: {
      minWidth: '40%',
      display: 'flex',
      flexDirection: 'column',
    },
    field: {
      margin: theme.spacing(1),
    },
    buttonWrapper: {
      margin: theme.spacing(1),
      display: 'flex',
      justifyContent: 'space-between',
    },
    loginButton: {
      flexGrow: 1,
    },
    regButton: {
      marginLeft: theme.spacing(1),
      flexGrow: 2,
    }
  }),
)

interface Credentials {
  login: string;
  password: string;
}

interface Props {
  login(credentials: Credentials): void;
}

interface State {
  login: string;
  password: string;
}

export const LoginComponent = ({ login }: Props): ReactElement => {
  const classes = useStyles()

  const [state, setState] = useState<State>({
    login: '',
    password: '',
  })

  const handleChange = (type: keyof State) => (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    if(value.length <= 20) {
      setState(prevState => ({ ...prevState, [type]: value }))
    }
  }

  const handleLogin = (): void => {
    login({ login: state.login, password: state.password })
  }

  return (
    <div className={classes.root}>
      <form className={classes.form}>
        <TextField
          className={classes.field}
          variant='outlined'
          label='Логин'
          value={state.login}
          onChange={handleChange('login')}
        />
        <TextField
          className={classes.field}
          variant='outlined'
          type='password'
          label='Пароль'
          value={state.password}
          onChange={handleChange('password')}
        />
        <div className={classes.buttonWrapper}>
          <Button
            className={classes.loginButton}
            variant='contained'
            size='large'
            color='primary'
            onClick={handleLogin}
          >
            Вход
          </Button>
          <Button
            className={classes.regButton}
            variant='contained'
            size='large'>
            Регистрация
          </Button>
        </div>
      </form>
    </div>
  )
}

export const Login = connect(
  (state: RootState) => ({
    userIsAuthenticated: state.user.isAuthenticated,
    error: state.user.error,
  }),
  (dispatch: AppDispatch) => ({
    login: (credentials: Credentials): void => dispatch(login(credentials))
  })
)(LoginComponent)
