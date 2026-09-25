package com.superdev.foodmanager.dtos.pedido;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PedidoCriarDto(

        @NotBlank
        @Size(min = 2, max = 100)
        String nomeCliente,

        @NotBlank
        LocalDate data,

        @NotBlank
        @DecimalMin(value = "0.01")
        BigDecimal valorTotal,

        String status,

        @NotBlank
        String formaPagamento,

        @Size(max = 255)
        String observacao,

        @NotBlank
        String tipoPedido,

        @NotBlank
        @PositiveOrZero
        @Max(value = 300)
        Integer tempoEstimado

) {
}
