import React, { ChangeEvent, ReactElement, useState } from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import { connect } from 'react-redux'
import { encryptString, generateKey } from 'grasshopper-ts'
import { JSEncrypt } from 'jsencrypt'

import { ProgressButton } from '../ProgressButton'
import { AppDispatch, RootState } from '../../store'
import { getRsaKey } from '../../reducers/getRsaKey'
import { LoadingState, RegUser, signUpUser, User } from '../../reducers'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      [theme.breakpoints.up('lg')]: {
        minWidth: '80vh',
      },
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
    },
    field: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    buttonGroup: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    groupedButton: {
      marginRight: theme.spacing(1),
    },
    button: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    }
  }),
)

interface Props {
  show: boolean;
  onClose: () => void;
  gettingRsaKey: LoadingState;
  getRsaKey: (email: string) => void;
  signingUp: LoadingState;
  signUpUser: (user: RegUser) => Promise<User>;
}

interface FormState {
  userName: string;
  password: string;
  personalData: string;
  encryptedData: string;
  gostKey: string;
  email: string;
  rsaKey: string;
  encryptedGostKey: string;
}

interface ProgressState {
  isGostKeyDownloaded: boolean;
}

const helperText = 'Длина - не менее 4-х символов, латиница. цифры'

const initialFormState = {
  userName: '',
  password: '',
  personalData: '',
  encryptedData: '',
  gostKey: '',
  email: '',
  rsaKey: '',
  encryptedGostKey: '',
}

export const RegistrationComponent = ({ show, onClose, gettingRsaKey, getRsaKey, signingUp, signUpUser }: Props): ReactElement => {
  const classes = useStyles()

  const [formState, setFormState] = useState<FormState>(initialFormState)

  const [progressStage, setProgressStage] = useState<ProgressState>({
    isGostKeyDownloaded: false,
  })

  const handleChange = (type: keyof FormState) => (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    if(['userName', 'password', 'email'].includes(type) && value.length <= 20) {
      const validatedValue = value.replace(/[^A-Za-z0-9@.]/ig, '')
      setFormState(prevState => ({ ...prevState, [type]: validatedValue }))
    } else if (['personalData', 'gostKey', 'rsaKey'].includes(type)) {
      setFormState(prevState => ({ ...prevState, [type]: value }))
    }
  }

  const handleDownloadGostKey = (): void => {
    setProgressStage(prevState => ({ ...prevState, isGostKeyDownloaded: true, }))
  }

  const handleGetRsaKey = (): void => {
    getRsaKey(formState.email)
  }

  const generateGostKey = (): void => {
    setFormState(prevState => ({ ...prevState, gostKey: generateKey() }))
  }

  const encryptDataAndKey = (): void => {
    const encrypt = new JSEncrypt()
    encrypt.setPublicKey(formState.rsaKey)
    const encrypted = encrypt.encrypt(formState.gostKey)

    setFormState(prevState => ({
      ...prevState,
      encryptedData: encryptString(formState.personalData, formState.gostKey),
      encryptedGostKey: encrypted
    }))
  }

  const handleRegistration = (): void => {
    signUpUser({
      login: formState.userName,
      password: formState.password,
      userData: formState.encryptedData,
      keyGost: formState.encryptedGostKey
    }).then(
      _ => {
        onClose()
        setFormState(initialFormState)
      },
      _ => null)
  }

  const downloadLink = URL.createObjectURL(new Blob([formState.gostKey], { type: 'text/plain' }))

  const isSaveGostKeyButtonActive = formState.gostKey.length > 0

  const isGetRsaKeyButtonActive = formState.email.length >= 4
    && /\S+@\S+\.\S+/.test(formState.email)

  const isEncryptButtonActive = isSaveGostKeyButtonActive
    && formState.personalData.length > 0
    && formState.rsaKey.length > 265
    && progressStage.isGostKeyDownloaded

  const isRegButtonActive = formState.userName.length >= 4
    && formState.password.length >= 4
    && isEncryptButtonActive
    && formState.encryptedGostKey.length > 0
    && formState.encryptedData.length > 0

  const isSigningUp = signingUp === LoadingState.Pending

  return (
    <Dialog open={show} maxWidth={false}>
      <div className={classes.root}>
      <DialogTitle>Регистрация</DialogTitle>
      <DialogContent>
        <form className={classes.form}>
          <TextField
            disabled={isSigningUp}
            className={classes.field}
            variant='outlined'
            label='Логин'
            value={formState.userName}
            onChange={handleChange('userName')}
            helperText={helperText}
          />
          <TextField
            disabled={isSigningUp}
            className={classes.field}
            variant='outlined'
            type='password'
            label='Пароль'
            value={formState.password}
            onChange={handleChange('password')}
            helperText={helperText}
          />
          <TextField
            disabled={isSigningUp}
            className={classes.field}
            variant='filled'
            multiline
            label='Персональные данные'
            value={formState.personalData}
            onChange={handleChange('personalData')}
          />
          <TextField
            disabled
            className={classes.field}
            variant='filled'
            multiline
            label='Обезличенные персональные данные'
            value={formState.encryptedData}
          />
          <div className={classes.buttonGroup}>
            <Button
              disabled={isSigningUp}
              className={classes.groupedButton}
              variant='contained'
              size='large'
              color='primary'
              onClick={generateGostKey}
            >
              Сгенерировать ключ ГОСТ
            </Button>
            <Button
              disabled={!isSaveGostKeyButtonActive || isSigningUp}
              variant='contained'
              size='large'
              color='primary'
              href={downloadLink}
              download='Ключ ГОСТ.txt'
              onClick={handleDownloadGostKey}
            >
              Сохранить в файл
            </Button>
          </div>
          <TextField
            disabled
            className={classes.field}
            variant='filled'
            multiline
            label='Ключ ГОСТ'
            value={formState.gostKey}
          />
          <TextField
            disabled
            className={classes.field}
            variant='filled'
            multiline
            label='Зашифрованный ключ ГОСТ'
            value={formState.encryptedGostKey}
          />
          <TextField
            disabled={isSigningUp}
            className={classes.field}
            variant='outlined'
            label='Email для отправки открытого ключа'
            value={formState.email}
            onChange={handleChange('email')}
          />
          <div className={classes.buttonGroup}>
            <ProgressButton
              className={classes.groupedButton}
              loading={gettingRsaKey === LoadingState.Pending}
              disabled={!isGetRsaKeyButtonActive || isSigningUp}
              variant='contained'
              size='large'
              color='primary'
              onClick={handleGetRsaKey}
            >
              Получить открытый ключ RSA
            </ProgressButton>
            <Button
              disabled={!isEncryptButtonActive || isSigningUp}
              variant='contained'
              size='large'
              color='primary'
              onClick={encryptDataAndKey}
            >
              Обезличить данные
            </Button>
          </div>
          <TextField
            disabled={isSigningUp}
            className={classes.field}
            variant='filled'
            multiline
            label='Открытый ключ RSA'
            value={formState.rsaKey}
            onChange={handleChange('rsaKey')}
          />
        </form>
      </DialogContent>
        <DialogActions>
          <ProgressButton
            loading={isSigningUp}
            disabled={!isRegButtonActive}
            className={classes.button}
            variant='contained'
            size='large'
            color='secondary'
            onClick={handleRegistration}
          >
            Зарегистрироваться
          </ProgressButton>
          <Button
            disabled={isSigningUp}
            className={classes.button}
            variant='contained'
            size='large'
            color='default'
            onClick={onClose}
          >
            Отмена
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  )
}

export const Registration = connect(
  (state: RootState) => ({
    gettingRsaKey: state.getRsaKey.loading,
    signingUp: state.user.signingUpUser,
  }),
  (dispatch: AppDispatch) => ({
    getRsaKey: (email: string): void => dispatch(getRsaKey(email)),
    signUpUser: (user: RegUser): Promise<User> => dispatch(signUpUser(user)),
  }),
)(RegistrationComponent)
