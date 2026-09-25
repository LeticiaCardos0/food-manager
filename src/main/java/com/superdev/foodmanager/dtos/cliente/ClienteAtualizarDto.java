package com.superdev.foodmanager.dtos.cliente;

import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ClienteAtualizarDto(
        @NotBlank
        @Size(min = 2, max = 60)
        String nome,

        @Size(min = 8, max = 100)
        String email,

        @Size(min = 8, max = 20)
        String telefone,

        @Size(min = 11, max = 25)
        String cpf,

        @Size(max = 255)
        String endereco,

        Boolean ativo,

        LocalDate dataCadastro
) {
}