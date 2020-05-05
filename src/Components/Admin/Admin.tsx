import React, { ChangeEvent, ReactElement, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'

import { AppDispatch, RootState } from '../../store'
import { fetchUsers, LoadingState, User } from '../../reducers'
import { ExpansionListPanel } from './ExpansionListPanel'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
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
    }
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

interface State {
  expanded?: string;
}

interface FormState {
  email: string;
  rsaPubKey: string;
}

const initialFormState = {
  email: '',
  rsaPubKey: '',
} as FormState

export const AdminComponent = ({ settingRsaKey, setRsaKey, gettingRsaKey, getRsaKey, fetchUsers, loading, users, error }: Props): ReactElement=> {
  const classes = useStyles()

  const [formState, setFormState] = useState<FormState>(initialFormState)

  useEffect(() => {
    fetchUsers()
  }, [])

  const [panelState, setPanelState] = useState<State>({
    expanded: null,
  })

  const handleFormChange = (type: keyof FormState) => (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    if (type === 'email' && value.length <= 20) {
      const validatedValue = value.replace(/[^A-Za-z0-9@.]/ig, '')
      setFormState(prevState => ({ ...prevState, [type]: validatedValue }))
    } else if (type === 'rsaPubKey' && value.length <= 900) {
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

  const isGetRsaKeyButtonActive = formState.email.length >= 4
    && /\S+@\S+\.\S+/.test(formState.email)

  const isSetRsaKeyButtonActive = formState.rsaPubKey.length > 265

  const renderPreloader = <CircularProgress />
  const renderError = <Typography variant='h4'>Ошибка загрузки данных</Typography>
  const renderList = (
    <div className={classes.root}>
      <div className={classes.container}>
        <div className={`${classes.form}, ${classes.border}`}>
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
              className={classes.field}
              variant='filled'
              multiline
              label='Открытый ключ RSA'
              value={formState.rsaPubKey}
              onChange={handleFormChange('rsaPubKey')}
            />
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
