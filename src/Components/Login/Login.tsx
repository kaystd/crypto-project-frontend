import React, { ChangeEvent, ReactElement, useState } from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { connect } from 'react-redux'
import { AppDispatch, RootState } from '../../store'
import { LoadingState, login } from '../../reducers'
import { ProgressButton } from '../ProgressButton'
import { Registration } from '../Registration'

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
      minHeight: 80,
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
    },
  }),
)

interface Credentials {
  login: string;
  password: string;
}

interface Props {
  loading: LoadingState;
  error: Error;
  login(credentials: Credentials): void;
}

interface FormState {
  userName: string;
  password: string;
}

interface DialogState {
  show: boolean;
}

export const LoginComponent = ({ loading, error, login }: Props): ReactElement => {
  const classes = useStyles()

  const [formState, setFormState] = useState<FormState>({
    userName: '',
    password: '',
  })

  const [dialogState, setDialogState] = useState<DialogState>({
    show: false,
  })

  const toggleRegistrationDialog = (show: boolean): void => {
    setDialogState({ show })
  }

  const handleChange = (type: keyof FormState) => (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    if(value.length <= 20) {
      const validatedValue = value.replace(/[^A-Za-z0-9]/ig, '')
      setFormState(prevState => ({ ...prevState, [type]: validatedValue }))
    }
  }

  const handleLogin = (): void => {
    login({ login: formState.userName, password: formState.password })
  }

  const disabledLogin = formState.userName.length < 4 && formState.password.length < 4
  const errorMessage = !!error && error.message.includes('401') ? 'Неверные учетные данные' : undefined

  return (
    <div className={classes.root}>
      <form className={classes.form}>
        <TextField
          className={classes.field}
          variant='outlined'
          label='Логин'
          value={formState.userName}
          onChange={handleChange('userName')}
          error={!!error}
          helperText={errorMessage}
        />
        <TextField
          className={classes.field}
          variant='outlined'
          type='password'
          label='Пароль'
          value={formState.password}
          onChange={handleChange('password')}
          error={!!error}
        />
        <div className={classes.buttonWrapper}>
          <div className={classes.loginButton}>
            <ProgressButton
              loading={loading === LoadingState.Pending}
              disabled={disabledLogin}
              variant='contained'
              size='large'
              color='primary'
              onClick={handleLogin}
            >
              Вход
            </ProgressButton>
          </div>
          <Button
            className={classes.regButton}
            variant='contained'
            size='large'
            onClick={(): void => toggleRegistrationDialog(true)}
          >
            Регистрация
          </Button>
        </div>
      </form>
      <Registration
        show={dialogState.show}
        onClose={(): void => toggleRegistrationDialog(false)}
      />
    </div>
  )
}

export const Login = connect(
  (state: RootState) => ({
    loading: state.user.loggingIn,
    userIsAuthenticated: state.user.isAuthenticated,
    error: state.user.error,
  }),
  (dispatch: AppDispatch) => ({
    login: (credentials: Credentials): void => dispatch(login(credentials))
  })
)(LoginComponent)
