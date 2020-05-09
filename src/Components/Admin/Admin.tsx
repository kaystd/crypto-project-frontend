import React, { ChangeEvent, ReactElement, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { JSEncrypt } from 'jsencrypt'

import { AppDispatch, RootState } from '../../store'
import { fetchUsers, LoadingState, User } from '../../reducers'
import { ExpansionListPanel } from './ExpansionListPanel'
import { ProgressButton } from '../ProgressButton'
import { getRsaKey, sendRsaKey } from '../../reducers/rsaKey'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '1 0 auto',
      flexDirection: 'column',
    },
    form: {
      display: 'flex',
      flexDirection: 'row',
      marginBottom: theme.spacing(2),
      justifyContent: 'space-between',
    },
    border: {
      border: 'solid',
      borderRadius: 4,
      borderColor: 'rgba(0, 0, 0, 0.12)',
      borderWidth: 1,
    },
    column: {
      display: 'flex',
      flexDirection: 'column',
      marginRight: theme.spacing(2),
      marginLeft: theme.spacing(2),
    },
    field: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    container: {
      [theme.breakpoints.up('md')]: {
        minWidth: '60%',
      },
      [theme.breakpoints.down('md')]: {
        minWidth: '90%',
      },
    },
    list: {
      display: 'flex',
      marginTop: theme.spacing(2),
    },
    listTitle: {
      marginBottom: theme.spacing(1),
      paddingRight: theme.spacing(2),
      paddingLeft: theme.spacing(2),
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
  })
)

interface Props {
  fetchUsers: () => void;
  loading: LoadingState;
  users: User[];
  error: Error;
  gettingRsaKey: LoadingState;
  settingRsaKey: LoadingState;
  getRsaKey: (email: string) => void;
  setRsaKey: (key: string) => void;
}

interface PanelState {
  expanded?: string;
}

interface ProgressState {
  isRsaPrivKeyDownloaded: boolean;
  isRsaPubKeyDownloaded: boolean;
}

interface FormState {
  email: string;
  rsaPrivKey: string;
  rsaPubKey: string;
}

const initialFormState = {
  email: '',
  rsaPrivKey: '',
  rsaPubKey: '',
} as FormState

export const AdminComponent = ({ settingRsaKey, setRsaKey, gettingRsaKey, getRsaKey, fetchUsers, loading, users, error }: Props): ReactElement=> {
  const classes = useStyles()

  const [formState, setFormState] = useState<FormState>(initialFormState)
  const [progressStage, setProgressStage] = useState<ProgressState>({
    isRsaPrivKeyDownloaded: false,
    isRsaPubKeyDownloaded: false,
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const [panelState, setPanelState] = useState<PanelState>({
    expanded: null,
  })

  const handleFormChange = (type: keyof FormState) => (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    if (type === 'email' && value.length <= 20) {
      const validatedValue = value.replace(/[^A-Za-z0-9@.]/ig, '')
      setFormState(prevState => ({ ...prevState, [type]: validatedValue }))
    } else if (type === 'rsaPrivKey' && value.length <= 900 || type === 'rsaPubKey' && value.length <= 270) {
      setFormState(prevState => ({ ...prevState, [type]: value }))
    }
  }

  const handleExpandedChange = (expandedElement: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean): void => {
    setPanelState(prevState => ({
      ...prevState,
      expanded: isExpanded ? expandedElement : null
    }))
  }

  const handleGetRsaKey = (): void => {
    getRsaKey(formState.email)
  }

  const handleSetRsaKey = (): void => {
    setRsaKey(formState.rsaPubKey)
  }

  const generateRsaKeys = (): void => {
    const encrypt = new JSEncrypt()

    setFormState(prevState => ({
      ...prevState,
      rsaPrivKey: encrypt.getPrivateKey(),
      rsaPubKey: encrypt.getPublicKey(),
    }))
    setProgressStage(prevState => ({
      ...prevState,
      isRsaPrivKeyDownloaded: false,
      isRsaPubKeyDownloaded: false,
    }))
  }

  const handleDownloadRsaPrivKey = (): void => {
    setProgressStage(prevState => ({ ...prevState, isRsaPrivKeyDownloaded: true, }))
  }
  const handleDownloadRsaPubKey = (): void => {
    setProgressStage(prevState => ({ ...prevState, isRsaPubKeyDownloaded: true, }))
  }

  const isSaveRsaPrivKeyButtonActive = formState.rsaPrivKey.length >= 850
  const isSaveRsaPubKeyButtonActive = formState.rsaPubKey.length >= 250

  const isGetRsaKeyButtonActive = formState.email.length >= 4
    && /\S+@\S+\.\S+/.test(formState.email)

  const isSetRsaKeyButtonActive = formState.rsaPubKey.length > 270
    && progressStage.isRsaPrivKeyDownloaded
    && progressStage.isRsaPubKeyDownloaded

  const downloadRsaPrivLink = URL.createObjectURL(new Blob([formState.rsaPrivKey], { type: 'text/plain' }))
  const downloadRsaPubLink = URL.createObjectURL(new Blob([formState.rsaPubKey], { type: 'text/plain' }))

  const renderPreloader = <CircularProgress />
  const renderError = <Typography variant='h4'>Ошибка загрузки данных</Typography>
  const renderList = (
    <div className={classes.root}>
      <div className={classes.container}>
        <div style={{ paddingTop: 10, paddingBottom: 10 }} className={`${classes.form}, ${classes.border}`}>
          <div className={classes.column}>
            <TextField
              className={classes.field}
              variant='outlined'
              label='Email для отправки открытого ключа'
              value={formState.email}
              onChange={handleFormChange('email')}
            />
            <ProgressButton
              className={classes.field}
              loading={gettingRsaKey === LoadingState.Pending}
              disabled={!isGetRsaKeyButtonActive}
              variant='contained'
              size='large'
              color='primary'
              onClick={handleGetRsaKey}
            >
              Получить открытый ключ RSA с сервера
            </ProgressButton>
          </div>
          <div className={classes.column}>
            <TextField
              disabled
              className={classes.field}
              variant='filled'
              multiline
              label='Закрытый ключ RSA'
              value={formState.rsaPrivKey}
              onChange={handleFormChange('rsaPrivKey')}
            />
            <TextField
              disabled
              className={classes.field}
              variant='filled'
              multiline
              label='Открытый ключ RSA'
              value={formState.rsaPubKey}
              onChange={handleFormChange('rsaPubKey')}
            />
            <Button
              className={classes.field}
              variant='contained'
              size='large'
              color='primary'
              onClick={generateRsaKeys}
            >
              Сгенерировать ключи
            </Button>
            <div className={classes.buttonGroup}>
              <Button
                disabled={!isSaveRsaPrivKeyButtonActive}
                className={classes.groupedButton}
                variant='contained'
                size='large'
                color='primary'
                href={downloadRsaPrivLink}
                download='Закрытый ключ RSA.txt'
                onClick={handleDownloadRsaPrivKey}
              >
                Сохранить закрытый ключ в файл
              </Button>
              <Button
                disabled={!isSaveRsaPubKeyButtonActive}
                variant='contained'
                size='large'
                color='primary'
                href={downloadRsaPubLink}
                download='Открытый ключ RSA.txt'
                onClick={handleDownloadRsaPubKey}
              >
                Сохранить открытый ключ в файл
              </Button>
            </div>
            <ProgressButton
              className={classes.field}
              loading={settingRsaKey === LoadingState.Pending}
              disabled={!isSetRsaKeyButtonActive}
              variant='contained'
              size='large'
              color='secondary'
              onClick={handleSetRsaKey}
            >
              Сменить открытый ключ RSA на сервере
            </ProgressButton>
          </div>
        </div>
        <div style={{ padding: 20, marginTop: 100 }} className={`${classes.list}, ${classes.border}`}>
          <Typography
            className={classes.listTitle}
            color='primary'
            variant='h6'>
            Пользователи
          </Typography>
          {users.filter(user => user.login !== 'Admin').map(user => (
            <ExpansionListPanel
              key={user.login}
              user={user}
              onChange={handleExpandedChange}
              expanded={panelState.expanded === user.login}
            />
          ))}
        </div>
      </div>
    </div>
  )

  return loading === LoadingState.Pending
    ? renderPreloader
    : error
      ? renderError
      : renderList
}

export const Admin = connect(
  (state: RootState) => ({
    loading: state.user.fetchingUsers,
    users: state.user.users,
    error: state.user.usersError,
    gettingRsaKey: state.rsaKey.loadingGet,
    settingRsaKey: state.rsaKey.loadingSend,
  }),
  (dispatch: AppDispatch) => ({
    fetchUsers: (): void => dispatch(fetchUsers()),
    getRsaKey: (email: string): void => dispatch(getRsaKey(email)),
    setRsaKey: (key: string): void => dispatch(sendRsaKey(key)),
  }),
)(AdminComponent)
