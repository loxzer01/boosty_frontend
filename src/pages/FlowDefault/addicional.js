import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  IconButton,
  Stack,
  Typography,
  Autocomplete,
  Chip,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const AdiccionalFields = ({ flowsData, fields, setFields }) => {
  const handleAddField = () => {
    console.log(fields);
    setFields([...fields, { text: [], inputText: "", flujo: "" }]);
  };

  const handleRemoveField = (index) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
  };

  const handleFieldChange = (index, field, value) => {
    const updatedFields = fields.map((f, i) =>
      i === index ? { ...f, [field]: value } : f
    );
    setFields(updatedFields);
  };

  const handleKeyPress = (e, index) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault(); // Evita agregar el espacio o enter en el input
      const newWord = fields[index].inputText.trim();
      if (newWord && !fields[index].text.includes(newWord)) {
        const updatedFields = fields.map((f, i) =>
          i === index ? { ...f, text: [...f.text, newWord], inputText: "" } : f
        );
        setFields(updatedFields);
      }
    }
  };

  const handleDeleteWord = (index, wordIndex) => {
    const updatedFields = fields.map((f, i) =>
      i === index
        ? { ...f, text: f.text.filter((_, wIndex) => wIndex !== wordIndex) }
        : f
    );
    setFields(updatedFields);
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && fields[index].inputText === "") {
      const updatedText = fields[index].text.slice(0, -1); // Elimina la última palabra
      const updatedFields = fields.map((f, i) =>
        i === index ? { ...f, text: updatedText } : f
      );
      setFields(updatedFields);
    }
  };

  return (
    <Stack gap={"12px"} marginTop={4}>
      <Typography fontSize={18} fontWeight={700}>
        Palabras Claves y Flujo
      </Typography>
      <Typography fontSize={12}>
        Elija las palabras claves que espera recibir de sus contactos, y el
        flujo que desea corresponder.
      </Typography>

      <Stack gap={2}>
        {fields.map((field, index) => (
          <Stack direction="row" spacing={2} key={index} alignItems="center">
            <Stack direction="row" gap={1}>
              {field.text.map((word, wordIndex) => (
                <Chip
                  key={wordIndex}
                  label={word}
                  onDelete={() => handleDeleteWord(index, wordIndex)}
                  style={{ borderRadius: "8px" }}
                />
              ))}
            </Stack>
            <TextField
              label={`Palabras claves`}
              value={field.inputText}
              onChange={(e) =>
                handleFieldChange(index, "inputText", e.target.value)
              }
              onKeyDown={(e) => handleBackspace(e, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              fullWidth
            />

            <Autocomplete
              disablePortal
              id="combo-box-demo"
              value={field.flujo}
              options={flowsData}
              onChange={(e, newValue) => {
                handleFieldChange(index, "flujo", newValue);
              }}
              sx={{ width: "100%" }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Elige un flujo"
                />
              )}
            />

            <IconButton
              color="secondary"
              onClick={() => handleRemoveField(index)}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Stack>
        ))}

        <Button variant="contained" onClick={handleAddField}>
          Agregar Nuevo Flujo
        </Button>
      </Stack>
    </Stack>
  );
};

export default AdiccionalFields;
