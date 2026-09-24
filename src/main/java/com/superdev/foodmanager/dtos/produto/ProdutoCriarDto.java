package com.superdev.foodmanager.dtos.produto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProdutoCriarDto(
        @NotBlank(message = "Nome é obrigatório")
        @Size(min = 2, max = 255, message = "Nome deve ter entre 2 e 255 caracteres")
        String nome,

        @NotNull(message = "Preço é obrigatório")
        @DecimalMin(value = "0.01", message = "Preço deve ser maior que zero")
        BigDecimal preco,

        @Size(max = 1000, message = "Descrição deve ter no máximo 1000 caracteres")
        String descricao,

        @NotNull(message = "Tempo de preparo é obrigatório")
        @Positive(message = "Tempo de preparo deve ser maior que zero")
        @Max(value = 300, message = "Tempo de preparo deve ser no máximo 300 minutos")
        Integer tempo_preparo
) {
}