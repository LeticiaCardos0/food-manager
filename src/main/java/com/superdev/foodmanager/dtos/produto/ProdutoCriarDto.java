package com.superdev.foodmanager.dtos.produto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProdutoCriarDto(
        @NotBlank
        @Size(min = 2, max = 255)
        String nome,

        @NotNull
        @DecimalMin(value = "0.01")
        BigDecimal preco,

        @Size(max = 1000)
        String descricao,

        @NotNull
        @Positive
        @Max(value = 300)
        Integer tempoPreparo
) {
}