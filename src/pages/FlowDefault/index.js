import React, { useState, useEffect, useReducer, useContext } from "react";

import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Avatar from "@material-ui/core/Avatar";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import { ListItem, ListItemText, Select } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactModal from "../../components/ContactModal";
import ConfirmationModal from "../../components/ConfirmationModal/";

import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";
import NewTicketModal from "../../components/NewTicketModal";
import { SocketContext } from "../../context/Socket/SocketContext";

import {
  AddCircle,
  Build,
  ContentCopy,
  DevicesFold,
  MoreVert,
  WebhookOutlined,
} from "@mui/icons-material";
import {
  Autocomplete,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import FlowBuilderModal from "../../components/FlowBuilderModal";
import {
  colorBackgroundTable,
  colorLineTable,
  colorLineTableHover,
  colorPrimary,
  colorTitleTable,
  colorTopTable,
} from "../../styles/styles";
import AdiccionalFields from "./addicional";
// import AdiccionalFields from "./addicional"

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];

    contacts.forEach((contact) => {
      const contactIndex = state.findIndex((c) => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });

    return [...state, ...newContacts];
  }

  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    const contactIndex = state.findIndex((c) => c.id === contact.id);

    if (contactIndex !== -1) {
      state[contactIndex] = contact;
      return [...state];
    } else {
      return [contact, ...state];
    }
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;

    const contactIndex = state.findIndex((c) => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    backgroundColor: "#ffff",
    borderRadius: 12,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  online: {
    fontSize: 11,
    color: "#25d366",
  },
  offline: {
    fontSize: 11,
    color: "#e1306c",
  },
}));

const FlowDefault = () => {
  const classes = useStyles();
  const history = useHistory();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [webhooks, setWebhooks] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedWebhookName, setSelectedWebhookName] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [contactTicket, setContactTicket] = useState({});
  const [deletingContact, setDeletingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDuplicateOpen, setConfirmDuplicateOpen] = useState(false);

  const [configExist, setConfigExist] = useState(false);

  const [flowsData, setFlowsData] = useState([]);
  const [flowsDataObj, setFlowsDataObj] = useState([]);

  const [flowSelectedWelcome, setFlowSelectedWelcome] = useState(null);

  const [flowSelectedPhrase, setFlowSelectedPhrase] = useState(null);

  const [hasMore, setHasMore] = useState(false);
  const [reloadData, setReloadData] = useState(false);

  const [selectedWhatsapp, setSelectedWhatsapp] = useState("");
  const [whatsAppNames, setWhatsAppNames] = useState([]);
  const [whatsApps, setWhatsApps] = useState([]);
  const [whatsAppSelected, setWhatsAppSelected] = useState({});
  const { companyId, whatsAppId } = user;

  const socketManager = useContext(SocketContext);

  const [fields, setFields] = useState([
    { text: [], inputText: "", flujo: null, id: "" },
  ]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  const getFlows = async () => {
    const getFlowsBuilder = await api.get("/flowbuilder").then((res) => {
      setFlowsData(res.data.flows.map((flow) => flow.name));
      setFlowsDataObj(res.data.flows);
      return res.data.flows;
    });

    console.log(getFlowsBuilder);
    return getFlowsBuilder;
  };

  const getFlowsDefault = async (F) => {
    await api.get("/flowdefault").then((res) => {
      if (res.data.flow?.companyId) {
        setConfigExist(true);
      }
      if (res.data.flowPhrase) {
        const data = res.data.flowPhrase.map((item) => {
          return {
            text: item.phrase.split(","),
            flujo: Number(item.phraseId),
            id: item.id,
            inputText: "",
          };
        });
        console.log(data);
        setFields([...data, ...fields]);
      }
      if (res.data.flow?.flowIdWelcome) {
        const flowName = F.filter(
          (item) => item.id === res.data.flow.flowIdWelcome
        );
        if (flowName.length > 0) {
          setFlowSelectedWelcome(flowName[0].name);
        } else {
          setFlowSelectedWelcome();
        }
      }
      if (res.data.flow?.flowIdNotPhrase) {
        const flowName = F.filter(
          (item) => item.id === res.data.flow.flowIdNotPhrase
        );
        if (flowName.length > 0) {
          setFlowSelectedPhrase(flowName[0].name);
        } else {
          setFlowSelectedPhrase();
        }
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        api
          .get(`/whatsapp`, { params: { companyId, session: 0 } })
          .then(({ data }) => {
            setWhatsApps(data);
          });
      };
      fetchContacts();
      setLoading(false);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, []);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-contact`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
      }
    });
    setLoading(true);
    getFlows().then((res) => {
      getFlowsDefault(res);
    });

    //getWhatsappSession()

    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const handleDeleteWebhook = async (webhookId) => {
    try {
      await api.delete(`/flowbuilder/${webhookId}`).then((res) => {
        setDeletingContact(null);
        setReloadData((old) => !old);
      });
      toast.success("Fluxo excluído com sucesso");
    } catch (err) {
      toastError(err);
    }
  };

  const handleSaveDefault = async () => {
    console.log(configExist);

    let idWelcome = flowsDataObj.filter(
      (item) => item.name === flowSelectedWelcome
    );
    let idPhrase = flowsDataObj.filter(
      (item) => item.name === flowSelectedPhrase
    );
    if (idWelcome.length === 0) {
      idWelcome = null;
    } else {
      idWelcome = idWelcome[0].id;
    }
    if (idPhrase.length === 0) {
      idPhrase = null;
    } else {
      idPhrase = idPhrase[0].id;
    }

    if (configExist) {
      try {
        await api
          .put(`/flowdefault`, {
            flowIdWelcome: idWelcome,
            flowIdPhrase: idPhrase,
            flowPhrase: fields
              .filter((item) => {
                const bool = (item.flujo === null) | (item.text.length === 0);
                return !bool;
              })
              .map((item) => {
                return {
                  phrase: item.text.join(","),
                  phraseId: Number(flowsData.indexOf(item.flujo) + 1),
                  id: item.id ? item.id : null,
                };
              }),
          })
          .then((res) => {
            setDeletingContact(null);
            setReloadData((old) => !old);
          });
        toast.success("Fluxos padrões atualizados");
      } catch (err) {
        toastError(err);
      }
    } else {
      try {
        await api
          .post(`/flowdefault`, {
            flowIdWelcome: idWelcome,
            flowIdPhrase: idPhrase,
          })
          .then((res) => {
            setDeletingContact(null);
            setReloadData((old) => !old);
          });
        toast.success("Fluxos padrões atualizados");
      } catch (err) {
        toastError(err);
      }
    }
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  return (
    <MainContainer className={classes.mainContainer}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        initialContact={contactTicket}
        onClose={(ticket) => {
          handleCloseOrOpenTicket(ticket);
        }}
      />
      <FlowBuilderModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        flowId={selectedContactId}
        nameWebhook={selectedWebhookName}
        onSave={() => setReloadData((old) => !old)}
      ></FlowBuilderModal>
      <ConfirmationModal
        title={
          deletingContact
            ? `${i18n.t("contacts.confirmationModal.deleteTitle")} ${
                deletingContact.name
              }?`
            : `${i18n.t("contacts.confirmationModal.importTitlte")}`
        }
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={(e) =>
          deletingContact ? handleDeleteWebhook(deletingContact.id) : () => {}
        }
      >
        {deletingContact
          ? `Tem certeza que deseja deletar este fluxo? Todas as integrações relacionados serão perdidos.`
          : `${i18n.t("contacts.confirmationModal.importMessage")}`}
      </ConfirmationModal>
      <MainHeader>
        <Title>Flujo predeterminado</Title>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Stack sx={{ padding: "12px", position: "relative" }}>
          <Stack sx={{ position: "absolute", right: 0 }}>
            {/* BOTÃO SALVAR */}
            <Button
              onClick={() => handleSaveDefault()}
              variant="contained"
              sx={{
                backgroundColor: colorPrimary(),
                "&:hover": {
                  backgroundColor: `${colorPrimary()} 90`,
                },
              }}
            >
              Guardar
            </Button>
            {/* FIM BOTÃO SALVAR */}
          </Stack>

          <Stack gap={"12px"}>
            <Typography fontSize={18} fontWeight={700}>
              Flujo de bienvenida
            </Typography>

            <Typography fontSize={12}>
              Este flujo se activa solo para nuevos contactos, personas que no
              tienes en tu lista de contactos y que han enviado un mensaje
            </Typography>

            {!loading && (
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                value={flowSelectedWelcome}
                options={flowsData}
                onChange={(event, newValue) => {
                  setFlowSelectedWelcome(newValue);
                }}
                sx={{ width: "100%" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Elige un flujo"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      style={{ borderRadius: "8px" }}
                    />
                  ))
                }
              />
            )}

            {loading && (
              <Stack alignSelf={"center"}>
                <CircularProgress sx={{ color: colorPrimary() }} />
              </Stack>
            )}
          </Stack>

          <Stack gap={"12px"} marginTop={4}>
            <Typography fontSize={18} fontWeight={700}>
              Flujo de respuesta predeterminada
            </Typography>
            <Typography fontSize={12}>
              La Respuesta Predeterminada se envía con cualquier carácter
              diferente de una palabra clave.
            </Typography>
            {!loading && (
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                value={flowSelectedPhrase}
                options={flowsData}
                onChange={(event, newValue) => {
                  setFlowSelectedPhrase(newValue);
                }}
                sx={{ width: "100%" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Elige un flujo"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      style={{ borderRadius: "8px" }}
                    />
                  ))
                }
              />
            )}
            {loading && (
              <Stack alignSelf={"center"}>
                <CircularProgress sx={{ color: colorPrimary() }} />
              </Stack>
            )}
          </Stack>
          <AdiccionalFields
            flowsData={flowsData}
            setFields={setFields}
            fields={fields}
          />
        </Stack>
      </Paper>
    </MainContainer>
  );
};

export default FlowDefault;
