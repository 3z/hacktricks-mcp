# LLM Training - Data Preparation

**These are my notes from the very recommended book** [**https://www.manning.com/books/build-a-large-language-model-from-scratch**](https://www.manning.com/books/build-a-large-language-model-from-scratch) **with some extra information.**

## Basic Information

You should start by reading this post for some basic concepts you should know about:

> Related: [0.-basic-llm-concepts.md](0.-basic-llm-concepts.md)

## 1. Tokenization

> [!TIP]
> The goal of this initial phase is very simple: **Divide the input in tokens (ids) in some way that makes sense**.

> Related: [1.-tokenizing.md](1.-tokenizing.md)

## 2. Data Sampling

> [!TIP]
> The goal of this second phase is very simple: **Sample the input data and prepare it for the training phase usually by separating the dataset into sentences of a specific length and generating also the expected response.**

> Related: [2.-data-sampling.md](2.-data-sampling.md)

## 3. Token Embeddings

> [!TIP]
> The goal of this third phase is very simple: **Assign each of the previous tokens in the vocabulary a vector of the desired dimensions to train the model.** Each word in the vocabulary will a point in a space of X dimensions.\
> Note that initially the position of each word in the space is just initialised "randomly" and these positions are trainable parameters (will be improved during the training).
>
> Moreover, during the token embedding **another layer of embeddings is created** which represents (in this case) the **absolute possition of the word in the training sentence**. This way a word in different positions in the sentence will have a different representation (meaning).

> Related: [3.-token-embeddings.md](3.-token-embeddings.md)

## 4. Attention Mechanisms

> [!TIP]
> The goal of this fourth phase is very simple: **Apply some attetion mechanisms**. These are going to be a lot of **repeated layers** that are going to **capture the relation of a word in the vocabulary with its neighbours in the current sentence being used to train the LLM**.\
> A lot of layers are used for this, so a lot of trainable parameters are going to be capturing this information.

> Related: [4.-attention-mechanisms.md](4.-attention-mechanisms.md)

## 5. LLM Architecture

> [!TIP]
> The goal of this fifth phase is very simple: **Develop the architecture of the full LLM**. Put everything together, apply all the layers and create all the functions to generate text or transform text to IDs and backwards.
>
> This architecture will be used for both, training and predicting text after it was trained.

> Related: [5.-llm-architecture.md](5.-llm-architecture.md)

## 6. Pre-training & Loading models

> [!TIP]
> The goal of this sixth phase is very simple: **Train the model from scratch**. For this the previous LLM architecture will be used with some loops going over the data sets using the defined loss functions and optimizer to train all the parameters of the model.

> Related: [6.-pre-training-and-loading-models.md](6.-pre-training-and-loading-models.md)

## 7.0. LoRA Improvements in fine-tuning

> [!TIP]
> The use of **LoRA reduce a lot the computation** needed to **fine tune** already trained models.

> Related: [7.0.-lora-improvements-in-fine-tuning.md](7.0.-lora-improvements-in-fine-tuning.md)

## 7.1. Fine-Tuning for Classification

> [!TIP]
> The goal of this section is to show how to fine-tune an already pre-trained model so instead of generating new text the LLM will select give the **probabilities of the given text being categorized in each of the given categories** (like if a text is spam or not).

> Related: [7.1.-fine-tuning-for-classification.md](7.1.-fine-tuning-for-classification.md)

## 7.2. Fine-Tuning to follow instructions

> [!TIP]
> The goal of this section is to show how to **fine-tune an already pre-trained model to follow instructions** rather than just generating text, for example, responding to tasks as a chat bot.

> Related: [7.2.-fine-tuning-to-follow-instructions.md](7.2.-fine-tuning-to-follow-instructions.md)
