package com.superdev.foodmanager.dtos.categoria;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoriaCriarDto (
        @NotBlank @Size(min = 2, max = 60)
        String nome,

        @Size(max = 255)
        String descricao

){}